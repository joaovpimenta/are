# ARE Domain Context

## Adventure

An interactive journey that composes scenes, puzzle mechanisms, artifacts, a theme and a scenario.

## Scene

A narrative step presented by an Adventure. A scene can expose one or more puzzle mechanisms and advances when its completion conditions are satisfied.

## Puzzle mechanism

The rules that turn player input into observable progress. A puzzle mechanism owns validation, reset behavior and success/error transitions independently from its renderer.

## Renderer

A DOM or Three.js presentation of a puzzle mechanism. A renderer translates pointer, touch or keyboard input into mechanism actions and displays the resulting state.

## Adventure session

The single owner of cross-mechanism progress, collected artifacts, current scene and completion. Renderers observe the session; they do not duplicate its facts.

## Artifact

An in-world object that the player sees, hears or manipulates. An artifact can be physical, digital or hybrid and should make sense inside the Scenario.

## Lab harness

The shared testing environment for puzzle mechanisms. It owns navigation, theme selection, reset, event history, accessibility checks and known-state tools.

## Theme

The semantic visual language shared by DOM and Three.js renderers.

## Scenario

The narrative environment, vocabulary and ambient treatment in which an Adventure takes place.

## Feedback

An in-world confirmation of progress, error or completion. Motion can reinforce feedback but cannot be its only carrier.

## Hint ladder

Three progressive hints: orientation, mechanism and assisted solution.

