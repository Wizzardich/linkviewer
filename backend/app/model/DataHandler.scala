package model

import com.typesafe.config.ConfigFactory
import play.api.libs.json._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo.json.collection._
import reactivemongo.api.{Cursor, MongoDriver, ReadPreference}
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import scala.language.postfixOps

trait BackendSettings {
  val config = ConfigFactory.load()
  val DBName = config.getString("mongo.database.name")
  val router = config.getString("mongo.router")
}

object DataHandler extends BackendSettings{
  private val driver = new MongoDriver

  private val connection = driver.connection(List(router))

  val db = Await.result(connection.database(DBName), 5 seconds)

  def links = db.collection[JSONCollection]("links")

  def query[T](collection: JSONCollection)(queryOpt: (String, Json.JsValueWrapper)*)(number: Int)(implicit fjs: Reads[T]):Future[Seq[T]] = {
    val q = Json.obj("$or" -> (for(obj <- queryOpt) yield Json.obj(obj)))

    collection.find(q).cursor[T](ReadPreference.primaryPreferred).collect[List](number, Cursor.FailOnError[List[T]]())
  }

  def queryOne[T](collection: JSONCollection)(queryOpt: (String, Json.JsValueWrapper)*)(implicit fjs: Reads[T]):Future[Option[T]] = {
    val q = Json.obj("$or" -> (for(obj <- queryOpt) yield Json.obj(obj)))

    collection.find(q).one[T]
  }

  def queryAll[T](collection: JSONCollection)(implicit fjs: Reads[T]):Future[Seq[T]] = {
    collection.find(Json.obj()).cursor[T](ReadPreference.primaryPreferred).collect[List](-1, Cursor.FailOnError[List[T]]())
  }

  def insert[T](collection: JSONCollection)(document: T)(implicit fjw: OWrites[T]) =
    collection.insert(document)
}