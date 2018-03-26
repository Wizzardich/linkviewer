package controllers

import javax.inject.Inject

import model.{DataFacade, LinkContainer}

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json.Json
import play.api.mvc._

class LinkStorage @Inject () extends InjectedController {

  def store = Action.async (parse.json) { data =>
    DataFacade.writeContainer(
      LinkContainer.createLinkContainer(
        (data.body \ "links").as[Seq[String]]
      )
    ).map(r => Ok(Json.toJson(r._id)))
  }

  def get(uuid: String) = Action.async {
    DataFacade.readContainer(uuid).map({
      case Some(t) => Ok(Json.toJson(t.links))
      case None => Ok(Json.obj())
    })
  }

}