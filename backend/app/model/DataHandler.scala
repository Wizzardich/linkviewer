package model

import com.typesafe.config.ConfigFactory
import play.api.libs.json._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo.json.collection._
import reactivemongo.api.{MongoDriver, ReadPreference}
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

trait BackendSettings {
  val config = ConfigFactory.load()
  val DBName = config.getString("mongo.database.name")
}

object DataHandler extends BackendSettings{
  /*
This is costy to create. REUSE.
 */
  private val driver = new MongoDriver
  /*
   * We'll have to connect to a replica set here. To do that we'll need to get all of mongo addresses written in etcd2
   * key-value storage
   * This is costy to create. REUSE.
   */
  private val connection = driver.connection(
    try {
      List[String](sys.env("ROUTER"))
    } catch {
      case _ => List[String]("localhost");
    }
  )

  val db = connection(DBName)

  def links = db.collection[JSONCollection]("links")

  def query[T](collection: JSONCollection)(queryOpt: (String, Json.JsValueWrapper)*)(number: Int)(implicit fjs: Reads[T]):Future[Seq[T]] = {
    val q = Json.obj("$or" -> (for(obj <- queryOpt) yield Json.obj(obj)))

    collection.find(q).cursor[T](ReadPreference.primaryPreferred).collect[List](number)
  }

  def queryOne[T](collection: JSONCollection)(queryOpt: (String, Json.JsValueWrapper)*)(implicit fjs: Reads[T]):Future[Option[T]] = {
    val q = Json.obj("$or" -> (for(obj <- queryOpt) yield Json.obj(obj)))

    collection.find(q).one[T]
  }

  def queryAll[T](collection: JSONCollection)(implicit fjs: Reads[T]):Future[Seq[T]] = {
    collection.find(Json.obj()).cursor[T](ReadPreference.primaryPreferred).collect[List]()
  }

  def insert[T](collection: JSONCollection)(document: T)(implicit fjw: OWrites[T]) =
    collection.insert(document)
}