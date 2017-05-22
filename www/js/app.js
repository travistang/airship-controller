// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova','ngCordovaBluetoothLE','chart.js'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
  
	console.log(JSON.stringify(window.cordova.plugins));
	bluetoothSerial.isEnabled(function(){console.log("Enabled");}
		,function(){console.log("Not enabled");});
    // check if location service is enabled
    if(window.cordova && window.cordova.plugins.Keyboard) 
  {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
   
   // bluetooth stuff
 
  }});
})
.controller('MainController',function($rootScope,$scope,$interval,$ionicPopup)
	 {
		$scope.deviceList = [];
		$scope.commandTask = null; // the command it is gonna send via the bluetooth. Not quite useful here
		$scope.selectedDevice = {address: null}; // the address of the selected device
		$scope.commandTimer = null;
		$scope.vJoystickTimer = null;
		$scope.hJoystickTimer = null;
		// param config variables
		$scope.taskControl =
		{
			_1: {reverse: false,power:0},
			_2: {reverse: false,power:0},
			_3: {reverse: false,power:0},
			_4: {reverse: false,power:0},
			_5: {reverse: false,power:0},
			_6: {reverse: false,power:0}
		}
		$scope.state = 
		{
			hasCandidateDevice: false,
			connected: false,
			discovering: false,
		}
		$scope.default_param_config = 
		{
			vertical_max_power : 180,
			horizontal_max_power : 120,
			horizontal_max_power_side : 300
		}

		$scope.param_config = 
		{
			vertical_max_power : 180,
			horizontal_max_power : 120,
			horizontal_max_power_side : 300
		}
		//Chart.js data

		$scope.motor_labels = ['1','2','3','4','5','6'];
		$scope.data = [0,0,0,0,0,0];

		$scope.hasCandidateDevice = false; //  indicates whether there are devices that is ready for paired or not
		$scope.connected = false; // indicates whether the app is connected to a bluetooth device or not
		$scope.discovering = false; // indicate whether the app is discovering devices or not
		$scope.connectBtnStyle = "button button-dark button-full";
		// util function
		// functions for bluetooth settings
		$scope.showParamConfig = function()
		{
			var paramConfigPopup = $ionicPopup.show({
				scope: $scope,
			    	title: "Parameter Config",
			    	templateUrl: "template/param_config.html",
			    	buttons: [
				{
				 	text: "Default",
			    		type: "button-default",
			    		onTap: function(e)
					{
						e.preventDefault();
						for(var config in $scope.default_param_config)
						{
							$scope.param_config[config] = $scope.default_param_config[config];
						}
						//$scope.param_config = $scope.default_param_config;
					}
				},{text: "Close",type: "button-default"}]
			})
		}
	
		$scope.showBluetoothPopup = function()
		{
			var bluetoothConfigPopup = $ionicPopup.show({
				scope: $scope,
				title: "Select Bluetooth Device",
			    	templateUrl: "template/bluetooth_config.html",
			    buttons: [{
				text: "Refresh",
				type: "button-default",
			 	onTap: function(e)
				{
					e.preventDefault();
					$scope.getDevice();	
				}	
			    },
			    {
				    text: "Connect",
				    type: "button-balanced",
				    onTap: function(e)
					{
						e.preventDefault();
						$scope.connect();	
					}
			    },
			    {
				    text: "Close",
				    type: "button-dark",
				    onTap: function(e)
				    {
					    // do nothing.
				    }
			    }]	
			})	
		}
		$scope.hstop = function()
		{
			$scope.taskControl._1.power = 0;
			$scope.taskControl._2.power = 0;
			$scope.taskControl._3.power = 0;
			$scope.sendCommand();
		}

		$scope.vstop = function()
		{
			$scope.taskControl._4.power = 0;
			$scope.taskControl._5.power = 0;
			$scope.taskControl._6.power = 0;
			$scope.sendCommand();
		}
		$scope.stop = function()
		{
			// horizontal propellers
			$scope.taskControl._1.power = 0;
			$scope.taskControl._2.power = 0;
			$scope.taskControl._3.power = 0;
			// vertical propellers
			$scope.taskControl._4.power = 0;
			$scope.taskControl._5.power = 0;
			$scope.taskControl._6.power = 0;

			$scope.sendCommand();
		}
		$scope.send = function(data)
		{
			bluetoothSerial.write(data,function(success)
				{
					//console.log("Sent:" + data);	
					bluetoothSerial.read(function(msg)
						{
							console.log(msg);
						});
				},function(failure)
				{
					console.log("Unable to send:" + data);
					$scope.connectBtnStyle = "button button-assertive button-full";
				});
		}
		$scope.sendCommand = function()
		{
			// TODO: modify me to send data through Bluetooth
			//console.log(JSON.stringify($scope.taskControl));
			// format:	reverse:power:reverse:power:reverse:power&
			var data = "";
			data += Math.round(Math.min(255,$scope.taskControl._1.power.toString())) + ":" + $scope.taskControl._1.reverse.toString() + ":";
			data += Math.round(Math.min(255,$scope.taskControl._2.power.toString())) + ":" + $scope.taskControl._2.reverse.toString() + ":";
			data += Math.round(Math.min(255,$scope.taskControl._3.power.toString())) + ":" + $scope.taskControl._3.reverse.toString() + ":";
			data += Math.round(Math.min(255,$scope.taskControl._4.power.toString())) + ":" + $scope.taskControl._4.reverse.toString() + ":";
			data += Math.round(Math.min(255,$scope.taskControl._5.power.toString())) + ":" + $scope.taskControl._5.reverse.toString() + ":";
			data += Math.round(Math.min(255,$scope.taskControl._6.power.toString())) + ":" + $scope.taskControl._6.reverse.toString() + "&";
			//console.log(data);
			$scope.send(data);
			
		}
		// init joystick
		$scope.v_joystick = new VirtualJoystick({
			container: document.getElementById('vertical-controller'),
			strokeStyle: "purple",
			mouseSupport: true,
			stationaryBase: true,
			limitStickTravel: true,
			stickRadius: 50,
			baseX: 70,
			baseY: 150,
			isLeft: true
		});
		$scope.joystick = new VirtualJoystick({
			container: document.getElementById('vertical-controller'), //TODO: this may be incorrect
			strokeStyle: "orange",
			mouseSupport: true,
			stationaryBase: true,
			limitStickTravel: true,
			stickRadius: 50,
			baseX: 500,
			baseY: 150,
			isLeft: false
		});
		// control validation to differentiate two joysticks
		$scope.v_joystick.addEventListener('touchStartValidation',function(e)
				{
					for(var touch in e.touches)
					{
						var touch = e.changedTouches[0];
						var distV = Math.abs(touch.pageX - 70);
						var distH = Math.abs(touch.pageX - 500);
						if (distV < distH) return true;
					}
					return false;
				});
		$scope.joystick.addEventListener('touchStartValidation',function(e)
				{
//					var touch = e.changedTouches[0];	
//					var distV = Math.abs(touch.pageX - 70);
//					var distH = Math.abs(touch.pageX - 500);
//					return distH < distV;
					for(var touch in e.touches)
					{
						var touch = e.changedTouches[0];
						var distV = Math.abs(touch.pageX - 70);
						var distH = Math.abs(touch.pageX - 500);
						if( distH < distV) return true;
					}
					return false;
				});
		/********************************Chart.js code ****************************************/

		/***************************************************2nd control method************************************************************/
		$scope.verticalControlCommand = function()
		{
			//dx = $scope.v_joystick.deltaX();
			//var max_power = 255;
			var v_dy = $scope.v_joystick.deltaY();
			var dir = false;
			//console.log("v_dy:" + v_dy);
			if (v_dy < 0)
			{
				v_dy = -v_dy;
				$scope.taskControl._4.reverse = dir;
				$scope.taskControl._5.reverse = dir;
				$scope.taskControl._6.reverse = dir;
			}else
			{

				$scope.taskControl._4.reverse = !dir;
				$scope.taskControl._5.reverse = !dir;
				$scope.taskControl._6.reverse = !dir;
			}
			
			$scope.taskControl._4.power = v_dy/50.0 * $scope.param_config.vertical_max_power;
			$scope.taskControl._5.power = v_dy/50.0 * $scope.param_config.vertical_max_power;
			$scope.taskControl._6.power = v_dy/50.0 * $scope.param_config.vertical_max_power;
			
			$scope.$digest();
		}
		$scope.horizontalControlCommand = function()
		{	
			var h_dx = $scope.joystick.deltaX();
			var h_dy = $scope.joystick.deltaY();
			// normalize the variable
			nx = h_dx / 50.0;
			nx = -nx;
			ny = h_dy / 50.0;
			// magnitute of nx,nr: (0,sqrt(2))
			r = Math.sqrt(nx * nx + ny * ny);
			// normalized magnitute
			nr = r / Math.sqrt(2); 
			// first motor: motor 1
			$scope.taskControl._1.power = Math.abs(ny) * $scope.param_config.horizontal_max_power;
			$scope.taskControl._1.reverse = (ny > 0);
			$scope.taskControl._1.reverse = !($scope.taskControl._1.reverse);
			// second motor: motor 2
			// axis @ 120 deg. normalized...
			var b_x = Math.sqrt(3)/4.0;
			var b_y = 0.25;
			// max projection length at n = (1,1):
			var max_proj_len = (Math.sqrt(3) + 1 ) / 4.0;
			// power = magnitute of projection on the axis @ 120 deg.
			var proj_mag = b_x * nx + b_y * ny;
			$scope.taskControl._2.power = Math.abs(proj_mag) / max_proj_len * $scope.param_config.horizontal_max_power_side;
			// TODO: tune me
			$scope.taskControl._2.reverse = (proj_mag < 0);
			//$scope.taskControl._2.reverse = (proj_mag > 0);
			
			// vector for representing the axis towards the direction of the third motor...
			var c_x = -b_x;
			var c_y = b_y;
			proj_mag = c_x * nx + c_y * ny;
			$scope.taskControl._3.power = Math.abs(proj_mag) / max_proj_len * ($scope.param_config.horizontal_max_power_side);
			$scope.taskControl._3.reverse = (proj_mag < 0);
			//$scope.taskControl._3.reverse = (proj_mag > 0);

		//	console.log("h_dx:" + h_dx + ",h_dy:" + h_dy);
			$scope.$digest();
		}
		document.getElementById('vertical-controller').addEventListener('touchstart',function(e)
		{
			$scope.stop();
		});	
		document.getElementById('vertical-controller').addEventListener('touchmove',function(e)
		{
			$scope.horizontalControlCommand();
			$scope.verticalControlCommand();
		});
		
		document.getElementById('vertical-controller').addEventListener('touchend',function(e)
		{
			// check if some touch is still there
			if(e.touches.length > 0)
			{
				var x = e.changedTouches[0].pageX;
				
				var distV = Math.abs(x - 70);
				var distH = Math.abs(x - 500);

				if( distV < distH )
				{
					console.log('vstop');
					$scope.v_joystick._stickX = $scope.v_joystick._baseX;
					$scope.v_joystick._stickY = $scope.v_joystick._baseY;

					//left just released, so vstop
					$scope.vstop();
					
				}else
				{
					console.log('hstop');
					$scope.joystick._stickX = $scope.joystick._baseX;
					$scope.joystick._stickY = $scope.joystick._baseY;
					$scope.hstop();
				}
			}else
			{

				$scope.v_joystick._stickX = $scope.v_joystick._baseX;
				$scope.v_joystick._stickY = $scope.v_joystick._baseY;
				$scope.joystick._stickX = $scope.joystick._baseX;
				$scope.joystick._stickY = $scope.joystick._baseY;
				$scope.stop();	
			}
			$scope.$digest();
		});

/*************************************************** end of 2nd control method************************************************************/
		$scope.connect = function()
		{
			console.log("Trying to connect" + $scope.selectedDevice);
			bluetoothSerial.connect($scope.selectedDevice.address,function(success)
					{
						// connection success, can start sending command now
						$scope.state.connected = true;	
						$scope.connectBtnStyle = "button button-balanced button-full";
						$scope.$digest();
						// construct the sender loop here
						$scope.commandTimer = setInterval(function()
							{
								$scope.sendCommand();
							},100);
					},function(failure)
					{
						//console.log(JSON.stringify(failure));
						$scope.state.connected = false;
						$scope.connectBtnStyle = "button button-assertive button-full";
						clearInterval($scope.commandTimer);
						$scope.$digest();
					})
		}
       		$scope.getDevice = function()
		 {
			 $scope.state.discovering = true;
			 $scope.state.hasCandidateDevice = false;
			 $scope.connectBtnStyle = "button button-dark button-full";
			 $scope.deviceList = []; // empty device found
			 bluetoothSerial.discoverUnpaired(function(devices)
					 {
						 console.log(JSON.stringify(devices));
						 $scope.deviceList = devices;
						 $scope.connectBtnStyle = "button button-positive button-full";
						 $scope.state.hasCandidateDevice = true;
						 $scope.state.discovering = false;
						 $scope.$digest();
					 },function(failure)
					 {
						 $scope.state.discovering = false;
						 $scope.state.hasCandidateDevice = false;
						 $scope.connectBtnStyle = "button button-energized button-full";
						 $scope.$digest();
					 });
	 	}
	 });
