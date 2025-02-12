import * as ecs from "@dcl/sdk/ecs"
import { Entity, GltfContainer, Transform, engine } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import * as dclu from '@dclu/dclu-liveteach'
import { ClassroomManager, ControllerUI } from "@dclu/dclu-liveteach/src/classroom"
import { PeerToPeerChannel } from "@dclu/dclu-liveteach/src/classroom/comms/peerToPeerChannel"
import { InteractiveModel } from "../contentUnits/InteractiveModel/interactiveModel"
import { Poll } from "../contentUnits/poll/poll"
import { Quiz } from "../contentUnits/quiz/quiz"
import { SeatingData } from "./UniversitySeatingData"
import * as classroomConfig from "./classroomConfigs/classroomConfig.json"
import { DisplayPanel } from "./displayPanel"
import { Door } from "./door"
import { Podium } from "./podium/podium"
import { setupUi } from "./ui"
import { BakeryGame } from "../contentUnits/Bakery/bakeryGame"

// let devLiveTeachContractAddress: string = "0xf44b11C7c7248c592d0Cc1fACFd8a41e48C52762"
let devTeachersContractAddress: string = "0x15eD220A421FD58A66188103A3a3411dA9d22295"
let devWorldsContractAddress: string = "0x4d999180fbdf91419e41fa5ada1b13bf864c0605"

export function main() {
  const communicationChannel = new PeerToPeerChannel()
  let useDev = true;

  if (useDev) {
    ClassroomManager.Initialise(communicationChannel, devWorldsContractAddress, devTeachersContractAddress, true, true)
  }
  else {
    // mainnet
    ClassroomManager.Initialise(communicationChannel, undefined, undefined, true, true)
  }

  ClassroomManager.RegisterClassroom(classroomConfig)

  const screen1 = new DisplayPanel(Vector3.create(23, 1.85, 21), Vector3.create(0, -135, 0), Vector3.create(0.5, 0.5, 0.5))
  const screen2 = new DisplayPanel(Vector3.create(24.5, 1.85, 16), Vector3.create(0, -90, 0), Vector3.create(1, 1, 1))
  const screen3 = new DisplayPanel(Vector3.create(23.5, 1.85, 10.5), Vector3.create(0, -45, 0), Vector3.create(1, 1, 1))
  const podium = new Podium()

  addScreen(classroomConfig.classroom.guid, Vector3.create(0.35, 1.7, -0.06), Quaternion.fromEulerDegrees(45, 90, 0), Vector3.create(0.2, 0.2, 0.2), podium.entity)
  addScreen(classroomConfig.classroom.guid, Vector3.create(0, 2.6, 0.1), Quaternion.fromEulerDegrees(0, -180, 0), Vector3.create(1.42 * 2, 1.42 * 2, 1.42 * 2), screen1.entity)
  addScreen(classroomConfig.classroom.guid, Vector3.create(0, 2.6, 0.1), Quaternion.fromEulerDegrees(0, -180, 0), Vector3.create(2.84, 2.84, 2.84), screen2.entity)
  addScreen(classroomConfig.classroom.guid, Vector3.create(0, 2.6, 0.1), Quaternion.fromEulerDegrees(0, -180, 0), Vector3.create(2.84, 2.84, 2.84), screen3.entity)

  //Register content units
  ClassroomManager.RegisterContentUnit("poll", new Poll())
  ClassroomManager.RegisterContentUnit("quiz", new Quiz())
  ClassroomManager.RegisterContentUnit("interactive_model", new InteractiveModel())
  ClassroomManager.RegisterContentUnit("bakery", new BakeryGame())

  //ClassroomManager.AddTestTeacherAddress("0x350bafa640535818db8c3170d48418b37abbedc1")

  dclu.setup({
    ecs: ecs,
    Logger: null
  })
  setupUi()


  let entity = engine.addEntity()
  Transform.create(entity, {
    position: Vector3.create(0, 0.02, 32),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: Vector3.create(1, 1, 1)
  })
  GltfContainer.create(entity, { src: "models/LiveTeachExampleClassRoom.glb" })

  // Add seating 
  let seatingData: SeatingData = new SeatingData()
  // Apply offset
  let offset = Vector3.create(0, 0, 32)
  seatingData.seats.forEach(seat => {
    seat.position = Vector3.add(seat.position, offset)
    seat.lookAtTarget = Vector3.create(29.77, 0.90, 15.94)
  });

  //Debugging  
  // seatingData.seats.forEach(seat => {
  //   let entity: Entity = engine.addEntity()
  //   Transform.create(entity, {position:seat.position, rotation: Quaternion.fromEulerDegrees(seat.rotation.x,seat.rotation.y,seat.rotation.z)})
  //   MeshRenderer.setBox(entity)
  // });


  //new dclu.seating.SeatingController(seatingData,Vector3.create(12,3,19),Vector3.create(10,7,12),true) // removing hide volume until exclude ID's are fully working in DCL
  new dclu.seating.SeatingController(seatingData, Vector3.create(12, -50, 19), Vector3.create(10, 7, 12), true) // Put the volume underground for now

  const doorParent = engine.addEntity()
  Transform.create(doorParent, {
    position: Vector3.create(0, 0, 32)
  })

  addDoor(doorParent, "models/doors.glb", [{ type: "sphere" as const, position: Vector3.create(-6, 0, 21), radius: 4 }])
}

export function addScreen(_guid: string, _position: Vector3, _rotation: Quaternion, _scale: Vector3, _parent: Entity): void {
  ClassroomManager.AddScreen(_guid, _position, _rotation, _scale, _parent)
}

export function addDoor(_parent: Entity, _model: string, _triggerShape: {
  type: "sphere",
  position: Vector3.MutableVector3;
  radius: number;
}[]) {
  const door = new Door(_parent, _model, _triggerShape)
  return door
}
