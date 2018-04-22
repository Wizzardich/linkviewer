name := "linkviewer_backend"

version in ThisBuild := "1.0.3"

lazy val `linkviewer_backend` = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.4"

libraryDependencies ++= Seq(
  guice,
  "org.reactivemongo" %% "play2-reactivemongo" % "0.13.0-play26"
)

version in Docker := s"${(version in ThisBuild).value}"

packageName in Docker := "linkviewer"

dockerUsername in Docker := Some("vtomash")