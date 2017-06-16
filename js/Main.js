var loadednum=0;

var preloader=[ 
	'models/plane.json', 'models/scoller.json','models/coin/coin.js','models/texture_scene/1_island.json','models/texture_scene/2_island_ship.json','models/texture_scene/3_mountain.json','models/texture_scene/4_ferris_wheel.json','models/texture_scene/5_stadium.json','models/texture_scene/6_waterslider.json','models/texture_scene/7_mountain_train.json','models/texture_scene/8_mountain.json','models/texture_scene/9_castle_top.json','models/texture_scene/10_castle_bottom.json','models/texture_scene/11_roller_coaster.json','models/texture_scene/12_ship.json','models/texture_scene/14_tree.json','models/texture_scene/15_house.json','models/texture_scene/16_castle_land.json','models/texture_scene/17_mountain2.json','models/texture_scene/19_greenland.json','models/texture_scene/20_road.json','models/texture_scene/pool.json'
];
var resourcenum= preloader.length;
var loadres = new Array();   
for (var i = 0; i < preloader.length; i++) {  
	loadres[i] = new XMLHttpRequest(); 
	loadres[i].open('GET', preloader[i], true);	
	loadres[i].send(); 				
	loadres[i].onload = function () {  
		Loaded();  
	}  
    loadres[i].onerror = function () {  
        alert("加载失败，请重试！");    
		}  
}   
function  Loaded(){
	var processBar = document.getElementById('progress-bar');
	var processText = document.getElementById('processText');
	loadednum++;
	var percent = parseInt(loadednum/resourcenum*100);
	processBar.style.width=percent+'%';
	processText.innerHTML = percent+'%'
	if(loadednum==resourcenum){
		onCompete();
	}
}
function onCompete(){
	document.getElementById( 'loader' ).style.visibility='hidden';
}
		
if ( ! Detector.webgl ) {
	Detector.addGetWebGLMessage();
	document.getElementById( 'world' ).innerHTML = "";
}
			
var container, stats;
var camera, scene, renderer,light,mixer;
var rotatescoller,bird;
var waterNormals,mirrorMesh,water;
var game;
var flag=false;
var moveLeft=false;
var moveRight=false;
var flymove=0;
var flyangle=0;
var group = new THREE.Group();
var matrix = new THREE.Matrix4();
var up = new THREE.Vector3( 0, 0, -1 );
var axis = new THREE.Vector3();
var body=new THREE.Object3D();
var coinsets=new THREE.Object3D();
var clock = new THREE.Clock();
var particletexture = new THREE.TextureLoader().load( 'images/star.png' ); 
var home=document.getElementById('home');
var endpage=document.getElementById('endpage-bg');
var bg_audio=document.getElementById('bg-music');
initgame();
init();
window.addEventListener('load', animate, false);
			
	
// start game
function initgame(){
	game={
	status: "playing",
	t:0,
	score:0,
	k:0,
	spline: new THREE.CatmullRomCurve3([
		new THREE.Vector3(-1095, 1285, 71),
		new THREE.Vector3(134, 920, 230),
		new THREE.Vector3(1170, 762, 615),
		new THREE.Vector3(2234, 628, 537),
		new THREE.Vector3(2618, 737, -701),
		new THREE.Vector3(1802, 488, -1260),
		new THREE.Vector3(823, 462, -1236),
		new THREE.Vector3(203, 307, -357),
		new THREE.Vector3(207, 275, 745),
		new THREE.Vector3(1031, 468, 1247),
		new THREE.Vector3(1280, 550, 256),
		new THREE.Vector3(1280, 448, -550)
		
		])
	};
	creatcoin();
}
			
function init() {
	renderer = new THREE.WebGLRenderer({alpha: false, antialias: false});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	container = document.getElementById('world');
	container.appendChild( renderer.domElement );
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.set( 0, 12, 32);
	body.add(camera);
	body.position.set(1200,800,1200);
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enablePan = false;
	controls.enableRotate=false;
	var hemilight = new THREE.HemisphereLight( 0xffffff,0xfff7e9, 0.9 );
	
	light = new THREE.DirectionalLight( 0xffffff, 0.6 );
	light.position.set(-1, 1, 1 );	
	light.castShadow = true;
	scene.add( hemilight );
	scene.add( light );
	scene.add(coinsets);
	scene.add(body);
	
	document.getElementById("toleft").addEventListener( 'mousedown', _toleftbegin, false );
	document.getElementById("toleft").addEventListener( 'mouseup', _toleftstop, false );
	document.getElementById("toright").addEventListener( 'mousedown', _torightbegin, false );
	document.getElementById("toright").addEventListener( 'mouseup', _torightstop, false );
	if(window.DeviceOrientationEvent){
		window.addEventListener('deviceorientation',DeviceOrientationHandler,false);}
	else{
		alert("您的手机不支持重力感应哦！");
	}				
	
	createPlane();
	loadbg();
	createSkybox();
	createWater();
	
}
			
function randomRange(min, max) {  
	return ((Math.random() * (max - min)) + min);
}
			
function Particle(){
	this.mesh = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: particletexture, color: 0xffffff
	}));
}

Particle.prototype.explode = function(pos, scale){
	var _this = this;
	var _p = this.mesh.parent;
	this.mesh.scale.set(scale, scale, scale);
	var targetX = pos.x + (-1 + Math.random()*2)*50;
	var targetY = pos.y + (-1 + Math.random()*2)*50;
	var speed = .6+Math.random()*.2;
	TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*10, y:Math.random()*10, z:Math.random()*10});
	TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
	TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
		if(_p) _p.remove(_this.mesh);
		  _this.mesh.scale.set(1,1,1);
	}});
}

var ParticlesHolder = function (){
	this.mesh = new THREE.Object3D();
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, scale){
	var nPArticles = density;
	for (var i=0; i<nPArticles; i++){
		var particle = new Particle();
		this.mesh.add(particle.mesh);
		particle.mesh.visible = true;
		var _this = this;
		particle.mesh.position.y = pos.y;
		particle.mesh.position.x = pos.x;
		particle.mesh.position.z = pos.z;
		particle.explode(pos,scale);
	}
}
			
function createSkybox(){
	var path = "images/sky_";
	var format = '.jpg';
	var urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
	];
	var materials = []; 
	for (var i = 0; i < urls.length; ++i) {
		var loader = new THREE.TextureLoader();
		loader.setCrossOrigin( this.crossOrigin );
		var texture = loader.load( urls[i], function(){}, undefined, function(){} );
		materials.push(new THREE.MeshBasicMaterial({
			map: texture 
		})
		); 
	} 
	var skyBox = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000 ), new THREE.MeshFaceMaterial( materials ) );
	skyBox.applyMatrix( new THREE.Matrix4().makeScale( 1, 1, -1 ) );
	scene.add( skyBox );		
}
			
function createWater(){
	waterNormals = new THREE.TextureLoader().load( 'models/texture_scene/waternormals.jpg' );
	waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
	water = new THREE.Water( renderer, camera, scene, {
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: waterNormals,
		alpha: 	1.0,
		sunDirection: light.position.clone().normalize(),
		sunColor: 0xffffff,
		waterColor: 0x0090c5,
		distortionScale: 50.0,
	});


	mirrorMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 100000, 100000),
		water.material
	);

	mirrorMesh.add( water );
	mirrorMesh.rotation.x = - Math.PI * 0.5;
	scene.add( mirrorMesh );
}
			
function creatcoin(){			
	var coinloader = new THREE.JSONLoader();
	coinloader.load( 'models/coin/coin.js', function (geometry,materials) {
	var coinmaterial = materials[0];
	coinmaterial.side = THREE.DoubleSide; 
	var mat=new THREE.MultiMaterial(materials);
	var nBlocs=100;
	var Pn=[];
	var Tn=new THREE.Vector3();
	for (var i=1; i<nBlocs; i+=2 ){
		Pn[i]=game.spline.getPoint(i/nBlocs);
		Tn[i]=game.spline.getTangent(i/nBlocs);
		var m=new THREE.Mesh(geometry, mat);
		var s=0.2;
		m.scale.set(s,s,s);
		m.position.set(Pn[i].x+randomRange(-12,12),Pn[i].y,Pn[i].z);
		var tt= game.spline.getTangent(i/nBlocs ).normalize();
		Tn.crossVectors( up, tt).normalize();
		var radians11 = Math.acos( up.dot( tt ) );
		m.quaternion.setFromAxisAngle( Tn, radians11 );
		coinsets.add(m);
		if(i%11==0){i=i+2;}
	}
	});
	var gifttexture = new THREE.TextureLoader().load( 'images/hongbao-min.png' ); 
	for(var j=13;j<100;j+=22){
		var gift = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: gifttexture, color: 0xffffff
		}));
	gift.scale.set(8,8,8);
		var giftPn=game.spline.getPoint(j/100);
		var giftTn=game.spline.getTangent(j/100);
		gift.position.set(giftPn.x+randomRange(-12,12),giftPn.y,giftPn.z);
		var kk= game.spline.getTangent(j/100).normalize();
	
		// calculate the axis to rotate around
		giftTn.crossVectors( up, kk).normalize();
		// calcluate the angle between the up vector and the tangent
		var radians12 = Math.acos( up.dot( kk) );
		
	// set the quaternion
		gift.quaternion.setFromAxisAngle( giftTn, radians12 );
		coinsets.add(gift);
	}
}
function loadbg(){
	var bgloader=new THREE.ObjectLoader();
	var url=['models/texture_scene/1_island.json','models/texture_scene/2_island_ship.json','models/texture_scene/3_mountain.json','models/texture_scene/4_ferris_wheel.json','models/texture_scene/5_stadium.json','models/texture_scene/6_waterslider.json','models/texture_scene/7_mountain_train.json','models/texture_scene/8_mountain.json','models/texture_scene/9_castle_top.json','models/texture_scene/10_castle_bottom.json','models/texture_scene/11_roller_coaster.json','models/texture_scene/12_ship.json','models/texture_scene/14_tree.json','models/texture_scene/15_house.json','models/texture_scene/16_castle_land.json','models/texture_scene/17_mountain2.json','models/texture_scene/19_greenland.json','models/texture_scene/20_road.json','models/texture_scene/pool.json'];
	for(var i=0;i<url.length;i++) 
	{
	bgloader.load(
	  url[i],
	  function(bgmodel) {
		for (let i = 0; i < bgmodel.children.length; i++) {
		  if (bgmodel.children[i].material) {
			if (bgmodel.children[i].material.materials) {
			  bgmodel.children[i].material.materials[0].side = THREE.DoubleSide;
			}
			else {
			  bgmodel.children[i].material.side = THREE.DoubleSide;
			}
		  }
				  
		}
		scene.add(bgmodel);
	  }
	);
	}
}
function createPlane(){
	var loader=new THREE.ObjectLoader();
		loader.load(
	  'models/plane.json',
	  function(plane){
		for (let i = 0; i < plane.children.length; i++) {
		  if (plane.children[i].material) {
			if (plane.children[i].material.materials) {
			  plane.children[i].material.materials[0].side = THREE.DoubleSide;
			
			}
			else {
			  plane.children[i].material.side = THREE.DoubleSide;
			}
		  }
		
		}
		plane.position.set(0,0,0);
		group.add(plane);
		
	  }
	);
	loader.load(
	  	'models/scoller.json',
	  	function(scoller){
			for (let i = 0; i < scoller.children.length; i++) {
		  		if (scoller.children[i].material) {
					if (scoller.children[i].material.materials) {
			  			scoller.children[i].material.materials[0].side = THREE.DoubleSide;
			  			
					}else {
			 			 scoller.children[i].material.side = THREE.DoubleSide;
					}
		 		}
			}
			rotatescoller=scoller;
			group.add(rotatescoller);
		
	    }
	);
	body.add(group);
}
			
//control the plane
	function _toleftbegin(){
		moveLeft=true;
	}
    function _toleftstop(e){
		e.preventDefault();
		moveLeft=false;
    }
   	function _torightbegin(){
		moveRight=true;
  	}
   	function _torightstop(e){
		e.preventDefault();
		moveRight=false;
   	}
function DeviceOrientationHandler(event){
	var alpha = event.alpha,
    beta = event.beta,
    gamma = event.gamma;

	if(alpha != null || beta != null || gamma != null){
    	if( gamma > 10 ){
        	moveRight=true;
    	}else if(gamma<-10){
        	moveLeft=true;
    	}else{ 
    		event.preventDefault();moveRight=false;moveLeft=false;
    	}
	}
}
			
function controlUpdate(tt){
	var actualV=0.5;
	var angleLR=0.02;
	group.position.x+=flymove;
	group.rotation.z=flyangle;
	if( moveLeft&&group.position.x>-10){
		if(flyangle<0.2){
			flyangle+=angleLR;
		}
	
		flymove-=actualV*tt;
	}else if(moveRight&&group.position.x<10){
		if(flyangle>-0.2){
		flyangle-=angleLR;
	}
		flymove+=actualV*tt;
	}  
	else {
		flymove=0;
	if(flyangle<-0.04){
		flyangle+=0.02;
	}
	else if(flyangle>0.04)
	{
		flyangle-=0.02;
	}
	else{
		flyangle=0;
		}
	}
}

function detectcollision(){
	var collisions;
	var rays = [
	  new THREE.Vector3(0, 0, 1),
	  new THREE.Vector3(1, 0, 1),
	  new THREE.Vector3(1, 0, 0),
	  new THREE.Vector3(1, 0, -1),
	  new THREE.Vector3(0, 0, -1),
	  new THREE.Vector3(-1, 0, -1),
	  new THREE.Vector3(-1, 0, 0),
	  new THREE.Vector3(-1, 0, 1),
	];
	for (var i = 0; i < rays.length; i++) {
		var caster = new THREE.Raycaster(body.position,rays[i],0,6);
		  // We reset the raycaster to this direction    
		collisions = caster.intersectObjects(coinsets.children);
		if (collisions.length > 0){
			game.score+=2;
			document.getElementById("track").innerHTML ='score: '+game.score;
			var collectcoin=collisions[0].object;
			coinsets.remove(collectcoin);
			var Particleset=new ParticlesHolder();
			Particleset.spawnParticles(collectcoin.position,6,1);
			scene.add(Particleset.mesh);	
		}
	}
}
			
function endgame(){
	group.position.set(0,0,0);
	for (var i = coinsets.children.length - 1; i >= 0; i--) {
		coinsets.remove(coinsets.children[i]);
	}
}
			
function showEndpage(){
	endpage.style.display="block";
	endpage.className = 'slowShow';

}
			
function hideEndpage(){
	endpage.style.display="none";
}
			
function animate(){
	requestAnimationFrame( animate );
	render();
}

function render(){

	if(flag&game.status=="playing"){
		var delta = clock.getDelta();
		rotatescoller.rotation.z+=delta*50;
		controlUpdate(delta);
		detectcollision();	
					
		var pt = game.spline.getPoint( game.t );
		body.position.set( pt.x, pt.y, pt.z );
	
		var tangent = game.spline.getTangent( game.t ).normalize();
		axis.crossVectors( up, tangent ).normalize();
		var radians = Math.acos( up.dot( tangent ) );
		
		// set the quaternion
		body.quaternion.setFromAxisAngle( axis, radians );
		//(k<1)?k+=0.01:k=1;
		if(game.t<0.1&game.k<=1){game.k+=0.01;}
		if(game.t>0.8&game.k>=0){game.k-=0.0004;}
		game.t+=0.00025*game.k;
		if(game.t>=1){
			game.status="gameover";
		}
	}
	if(game.status=="gameover"){
		scoreBox.innerHTML = game.score;
		scores.style.display = 'none';
		showEndpage();
	}
	var time = performance.now() * 0.1;
	water.material.uniforms.time.value += 2.0 / 60.0;
	water.render();				
	renderer.render( scene, camera );
}
			
/*落地页呈现*/			
var allScores = 0;
var scoreBox = document.getElementById('scoreBox');
var scores = document.getElementById('track');
function bindEvent(){
	var startBtn = document.getElementById('btn_start');
	var gameAgainBtn = document.getElementById('gameAgain');
	var jumpUrlBtn = document.getElementById('jumpBtn');
	var shareBtn = document.getElementById('share');
	var sharebox = document.getElementById('shareBox');
	

	//开始游戏
	startBtn.addEventListener( 'click', function(){
		home.style.display="none";
		scores.style.display = 'block';
		bg_audio.play();
		flag=true;
	} , false );

	//再来一次
	gameAgainBtn.addEventListener('click', function(){
		endgame();
		initgame();
		hideEndpage();
		flag=true;
	} , false );

	//分享按钮
	shareBtn.addEventListener('click', function(){
		allScores = scoreBox.innerHTML;
		alert(allScores);
		if(!_tc_bridge_public.isTc){
			sharebox.style.display = 'block';
		}
		shareGame();
	} , false );

	sharebox.onclick = function(){
		this.style.display = 'none';
	}


}

function shareGame(){
	var shareImage ="http://file.40017.cn/tcweb/swact/20170518hls/img/share.jpg";
	var shareTitle ='xxxxxx'+allScores;
	var shareContent ='vvvvv';
	var shareUrl = window.location.href+'?redfid=305753413';
		
	if(_tc_bridge_public.isTc){
			
		_tc_bridge_bar.shareInfoFromH5({
			param: {
				"tcsharetxt": shareTitle,
				"tcsharedesc": shareContent,
				"tcshareurl": shareUrl,
				"tcshareimg": shareImage
			},
			callback: function (data) {// 仅微信单独的分享才有回调信息。
				alert("callback:" + JSON.stringify(data));
			}
		})
	}else{
		fed_wxshare.config({
		// jsApiList: [],//非必传；需要使用的JS接口列表，参数为数组类型，默认为['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo'];
			shareImg: shareImage,//必传
			shareUrl: shareUrl,//必传
			shareTitle: shareTitle,//非必传
			shareDesc: shareContent//非必传
		})
	}
}
function initData(){
	
	if(!_tc_bridge_public.isTc){
		shareGame();
	}
	_tc_bridge_bar.set_navbar({
		"param": {
			'center': [{'tagname': "tag_title", 'value': '616同程周年庆'}],
			"right": [{"tagname": "tag_click_city", "icon_type": "",'icon':'i_share'}]
		},
		'callback':function(data){
			shareGame();
		}
	})
	bindEvent();
}
initData()