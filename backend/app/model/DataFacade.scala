package model

import java.util.Date

import scala.concurrent.ExecutionContext.Implicits.global
/**
  * Created by wizzardich on 4/30/16.
  */

case class LinkContainer(_id: String, links: Seq[String], submitted: Date)

object LinkContainer {
  def createLinkContainer(links: Seq[String]) = LinkContainer(
    java.util.UUID.randomUUID().toString,
    links,
    new Date()
  )
}


object JsonFormats {
  import play.api.libs.json.Json

  // Generates Writes and Reads for Feed and User thanks to Json Macros
  implicit val dateFormat = Json.format[Date]
  implicit val containerFormat = Json.format[LinkContainer]
}

object DataFacade {
  import DataHandler._
  import JsonFormats._

  def writeContainer(container: LinkContainer) =
    insert[LinkContainer](links)(container)

  def readContainer(_id: String) =
    queryOne[LinkContainer](links)("_id" -> _id)
}