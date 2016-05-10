package controllers

import play.api._
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.Future

class LinkStorage extends Controller {

  def store = Action.async {
    Future(Ok(Json.obj()))
  }

  def get(uuid: String) = Action.async {
    Future(Ok(Json.obj()))
  }

}