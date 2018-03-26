package model

import org.joda.time.{DateTime, DateTimeZone}
import play.api.libs.json.{JsSuccess, _}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
/**
  * Created by wizzardich on 4/30/16.
  */

case class LinkContainer(_id: String, links: Seq[String], submitted: DateTime)

object LinkContainer {
  def createLinkContainer(links: Seq[String]) = LinkContainer(
      java.util.UUID.randomUUID().toString,
      links,
      DateTime.now(DateTimeZone.UTC)
    )
}


object JsonFormats {
  import play.api.libs.json.Json

  implicit object DefaultJodaDateWrites extends Writes[org.joda.time.DateTime] {
    def writes(d: org.joda.time.DateTime): JsValue = Json.obj("$date" -> JsNumber(d.getMillis))
  }

  implicit object DefaultJodaDateReads extends Reads[org.joda.time.DateTime] {
    def reads(json: JsValue): JsResult[DateTime] = json match {
      case JsObject(j) => j.get("$date") match {
        case Some(JsNumber(d)) => JsSuccess(new DateTime(d.toLong))
        case _ => throw new IllegalArgumentException("Should not be here, wrong Json")
      }
      case _ => throw new IllegalArgumentException("Should not be here, wrong Json")
    }
  }

  implicit val containerFormat: OFormat[LinkContainer] = Json.format[LinkContainer]
}

object DataFacade {
  import DataHandler._
  import JsonFormats._

  def writeContainer(container: LinkContainer) =
    insert[LinkContainer](links)(container).flatMap(r => Future(container))

  def readContainer(_id: String) =
    queryOne[LinkContainer](links)("_id" -> _id)
}