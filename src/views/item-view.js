export class ItemView {
    constructor(context) {
        this.context = context;
    }
    open(object) {
        object = object || this.context.sceneGraph.currentScene;
        this.isTop = object === this.context.sceneGraph.currentScene;
        this.context.breadCrumbs.make(this.context.breadCrumbs.fromObject(object));
        if(this.isTop){
            this.context.displayBox.hide();
        }
        this.isGroup = object.settings.type==="Object3D";
        this.is3dModel = object.settings.type==="Poly"||object.settings.type==="Custom";
        this.context.currentObject = object;
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadScreen('item-view',[
            'title-section',
            'three-number-inputs',
            'object-stats',
            'mobile-response',
            'single-item-button',
            'double-item-button',
            'side-item-add'
        ],true)
            .then(()=>this.hideNotNeeded())
            .then(()=>this.showTransformSettings(object))
            .then(()=>this.context.viewUtils.title(this.isTop?object.metadata.name:object.settings.name,object.settings.uuid))
            .then(()=>this.context.viewUtils.stats(object))
            .then(()=>this.context.content.compileTemplates('single-item-button',[{
                title:'Save Prefab',
                description:'Save this scene as a prefab to import it later',
                buttonText:'SAVE PREFAB',
                descriptionHeight:0.21,
            }]))
            .then(contents=>this.context.content.addTemplateItem('#savePrefab',contents[0]))
            .then(()=>{
                document.querySelector('#savePrefab').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.savePrefabModal.open();
                });
            })
            .then(()=>this.showMaterialAndGeometrySettings())
            .then(()=>this.context.content.compileTemplates('single-item-button',[{
                title:'Behaviours',
                description:'Add/update behaviours on the scene',
                buttonText:'BEHAVIOURS',
                descriptionHeight:0.21,
            }]))
            .then(contents=>this.context.content.addTemplateItem('#behavioursContainer',contents[0]))
            .then(()=>{
                document.querySelector('#behavioursContainer').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.behavioursModal.open();
                });
            })
            .then(()=>this.setupRemoveObject())
            .then(()=>this.show3dModelSettings())
            .then(()=>this.setupClearScene())
            .then(()=>this.setupMobileResponse(object))
            .then(()=>this.context.content.compileTemplates('side-item-add',[{
                title:'Objects',
                buttonText:'ADD OBJECT',
                children:this.context.currentObject.children.map(c=>this.context.viewUtils.childObject(c))
            }]))
            .then(contents=>this.context.content.addTemplateItem('#childObjectsContainer',contents[0],true))
            .then(()=>this.setupChildren())
            .then(()=>this.setupAddItem())
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>this.context.content.reloadContent());
    }
    setupRemoveObject(){
        if(this.isTop)return;
        return this.context.content.compileTemplates('single-item-button',[{
            title:'Remove',
            description:'remove this object from the scene.',
            buttonText:'REMOVE OBJECT',
            buttonColor:'#e57373',
            buttonFontColor:'white',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#removeObject',contents[0]));

    }
    showMaterialAndGeometrySettings(){
        if(this.isTop||this.isGroup||this.is3dModel)return;
        let isPrimitive = this.context.currentObject.settings.type==="Primitive";
        let material = this.context.currentObject.settings.material;
        let geometry = this.context.currentObject.settings.geometry;
        return this.context.content.compileTemplates('double-item-button',[{
            title:'Material Settings: '+material.type.substr(4,material.type.length-12),
            description:'Change settings like color and opacity',
            buttonText:'CHANGE TYPE',
            buttonTwoText:'MATERIAL SETTINGS',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#materialSettings',contents[0]+
            `<a-ui-button class="intersectable doubleButton3" text-value="MAP SETTINGS" width="1.2" height="0.2" ripple-size="1.2 0.2" wrap-count="24" ui-modal="modal:#modalRenderer;main:#mainRenderer" font-color="#009688" color="white" ripple-color="#009688"></a-ui-button>
             <a-ui-button class="intersectable doubleButton4" text-value="REPEAT & OFFSET" width="1.2" height="0.2" ripple-size="1.2 0.2" wrap-count="24" ui-modal="modal:#modalRenderer;main:#mainRenderer" font-color="#009688" color="white" ripple-color="#009688"></a-ui-button>`))
            .then(()=>{
                document.querySelector('#materialSettings').querySelector('.doubleButton1').addEventListener('mousedown',()=>{
                    this.context.materialTypeModal.open();
                });
                document.querySelector('#materialSettings').querySelector('.doubleButton2').addEventListener('mousedown',()=>{
                    this.context.materialSettingsModal.open();
                });
                document.querySelector('#materialSettings').querySelector('.doubleButton3').addEventListener('mousedown',()=>{
                    this.context.mapSettingsModal.open();
                });
                document.querySelector('#materialSettings').querySelector('.doubleButton4').addEventListener('mousedown',()=>{
                    this.context.repeatSettingsModal.open();
                });
            })
            .then(()=>this.context.content.compileTemplates('double-item-button',[{
                title:'Geometry Settings: '+(isPrimitive?geometry.type
                    .replace('Geometry','')
                    .replace('Buffer','')
                    .replace('Inverted',''):'Parametric'),
                description:'Change the geometry settings for this object',
                buttonText:'CHANGE TYPE',
                buttonTwoText:'GEOMETRY SETTINGS',
                descriptionHeight:0.21,
            }]))
            .then(contents=>this.context.content.addTemplateItem('#geometrySettings',contents[0]))
            .then(()=>{
                document.querySelector('#geometrySettings').querySelector('.doubleButton1').addEventListener('mousedown',()=>{
                    this.context.geometryTypeModal.open();
                });
                document.querySelector('#geometrySettings').querySelector('.doubleButton2').addEventListener('mousedown',()=>{
                    this.context.geometrySettingsModal.open();
                });
            })
    }
    setupMobileResponse(object){
        if(this.isTop) return;
        return this.context.content.compileTemplates('mobile-response',[{
            hide_on_mobile:object.settings.hide_on_mobile,
            show_only_on_mobile:object.settings.hide_on_desktop
        }])
            .then(contents=>this.context.content.addTemplateItem('#mobileSettings',contents[0]));
    }
    setupClearScene(){
        if(!this.isTop) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Clear Scene',
            description: 'Clear everything out of this scene',
            buttonText: 'CLEAR EVERYTHING',
            buttonColor:'#e57373',
            buttonFontColor:'white',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#clearScene', contents[0]))
            .then(()=>{
                document.querySelector('#clearScene').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.clearSceneModal.open();
                });
            })
    }
    showTransformSettings(){
        if(this.isTop)return;
        return this.context.content.compileTemplates('single-item-button',[{
            title:'Object Transform',
            description:'Change position, rotation and scale settings',
            buttonText:'TRANSFORM SETTINGS',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#transformSettings',contents[0]))
            .then(()=>{
                document.querySelector('#transformSettings').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.transformModal.open();
                });
            })
        // let rotation = object.settings.transform.rotation;
        // return this.context.content.compileTemplates('three-number-inputs',[
        //     {name:'Position',vector:object.settings.transform.position,className:'positionSettings'},
        //     {name:'Rotation',vector:{x:THREE.Math.radToDeg(rotation.x),y:THREE.Math.radToDeg(rotation.y),z:THREE.Math.radToDeg(rotation.z)},className:'rotationSettings'},
        //     {name:'Scale',vector:object.settings.transform.scale,className:'scaleSettings'}
        // ])
        //     .then(contents=>{
        //         for(let i = 0; i < contents.length; i++){
        //             this.context.content.addTemplateItem('#transformSettings',contents[i]);
        //         }
        //         this.setupTransformListeners();
        //         this.setupTransformButtons();
        //     })
    }
    show3dModelSettings(){
        if(!this.is3dModel) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Model Settings',
            description: 'Adjust the urls of this model.',
            buttonText: 'MODEL SETTINGS',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#modelSettings', contents[0]));
    }
    setupAddItem(){
        let loadButton = document.querySelector('#childObjectsContainer').querySelector('.loadItem');
        loadButton.addEventListener('mousedown', e => {
            this.context.objectTypeModal.open();
        });
    }
    setupChildren(){
        let openButtons = document.querySelector('#childObjectsContainer').querySelectorAll('.openItem');
        for(let i = 0; i < openButtons.length; i++){
            let openButton = openButtons[i];
            openButton.addEventListener('mousedown', e => {
                let child;
                for(let i =0; i < this.context.currentObject.children.length; i++){
                    let _child = this.context.currentObject.children[i]
                    if(_child.settings.uuid===openButton.dataset.uuid){
                        child = _child;
                    }
                }
                if(child){
                    this.context.displayBox.setObject(child.object3D);
                    this.context.itemView.open(child);
                }
            })
        }
    }
    hideNotNeeded(){
        if(this.isTop){
            let transformSection = document.getElementById('transformSettings');
            transformSection.parentElement.removeChild(transformSection);
            let geometrySettings = document.getElementById('geometrySettings');
            geometrySettings.parentElement.removeChild(geometrySettings);
            let materialSettings = document.getElementById('materialSettings');
            materialSettings.parentElement.removeChild(materialSettings);
            let mobileSettings = document.getElementById('mobileSettings');
            mobileSettings.parentElement.removeChild(mobileSettings);
            let modelSettings = document.getElementById('modelSettings');
            modelSettings.parentElement.removeChild(modelSettings);
            let sceneSettings = document.getElementById('sceneSettings');
            sceneSettings.parentElement.removeChild(sceneSettings);
        }else if(this.isGroup){
            let clearScene = document.getElementById('clearScene');
            clearScene.parentElement.removeChild(clearScene);
            let transformSection = document.getElementById('sceneSettings');
            transformSection.parentElement.removeChild(transformSection);
            let geometrySettings = document.getElementById('geometrySettings');
            geometrySettings.parentElement.removeChild(geometrySettings);
            let materialSettings = document.getElementById('materialSettings');
            materialSettings.parentElement.removeChild(materialSettings);
            let modelSettings = document.getElementById('modelSettings');
            modelSettings.parentElement.removeChild(modelSettings);
        }else if(this.is3dModel){
            let clearScene = document.getElementById('clearScene');
            clearScene.parentElement.removeChild(clearScene);
            let transformSection = document.getElementById('sceneSettings');
            transformSection.parentElement.removeChild(transformSection);
            let geometrySettings = document.getElementById('geometrySettings');
            geometrySettings.parentElement.removeChild(geometrySettings);
            let materialSettings = document.getElementById('materialSettings');
            materialSettings.parentElement.removeChild(materialSettings);
        }else{
            let clearScene = document.getElementById('clearScene');
            clearScene.parentElement.removeChild(clearScene);
            let transformSection = document.getElementById('sceneSettings');
            transformSection.parentElement.removeChild(transformSection);
            let modelSettings = document.getElementById('modelSettings');
            modelSettings.parentElement.removeChild(modelSettings);
        }
    }
}