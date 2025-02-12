import { Entity, GltfContainer, Transform, TransformTypeWithOptionals, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { Draw } from "./draw";
import { Oven } from "./oven";
import { Instructions } from "./instructions";
import { PlaceableArea } from "./items/placeableArea";
import { ItemManager } from "./items/itemManager";

export class Kitchen{
    oven:Oven
    counterEntity: Entity
    topDrawPositions: number [] = [-0.302,-0.93,-2.327,-2.955]
    bottomDrawPositions: number [] = [-0.04,-0.668,-2.065,-2.693]
    itemManager: ItemManager
    instructions: Instructions
    static instance:Kitchen
    draws:Draw[] = []

    constructor(_transform:TransformTypeWithOptionals){
        this.counterEntity = engine.addEntity()
        this.itemManager = new ItemManager(this.counterEntity)

        Transform.create(this.counterEntity, _transform)
        GltfContainer.create(this.counterEntity, {src:"contentUnits/Bakery/models/counter.glb"})

        this.oven = new Oven(this.counterEntity)

        // Add the top draws
        this.topDrawPositions.forEach(drawPosition => {
            let draw = new Draw("contentUnits/Bakery/models/topDraw.glb",true)
            Transform.create(draw.entity, {
                parent:this.counterEntity,
                position: Vector3.create(drawPosition,0.98,0.01)
            })
            draw.startPos = Transform.get(draw.entity).position
            this.draws.push(draw)
            this.itemManager.placeableAreas.push(new PlaceableArea(draw.entity,Vector3.create(0,-0.12,-0.2)))
        });        

        this.bottomDrawPositions.forEach(drawPosition => {
            let draw = new Draw("contentUnits/Bakery/models/bottomDraw.glb",false)
            Transform.create(draw.entity, {
                parent:this.counterEntity,
                position: Vector3.create(drawPosition,0.46,0.03)
            })
            draw.startRot = Transform.get(draw.entity).rotation
            this.draws.push(draw)
        });

        
        this.instructions = new Instructions({
            position: Vector3.create(20.5,4,13.5), 
            rotation: Quaternion.fromEulerDegrees(0,0,0) 
        }) 

        this.itemManager.spawnIngredients()

        Kitchen.instance = this
    }

    destroy(){
        this.itemManager.destroy()
        this.instructions.destroy()
        this.oven.destroy()
        this.draws.forEach(draw => {
            engine.removeEntity(draw.entity)
        });
        this.draws = []
        engine.removeEntity(this.counterEntity)
    }
}