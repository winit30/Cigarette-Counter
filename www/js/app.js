//Initializing app variables
var currentDate = new Date();
var getDate;
var s;
var cigRecords;
var countries = {
'Afghan afghani':'&#x60b;',
'Euro':'&#x20ac;',
'Dollar':'&#x0024;',
'Bangladeshi taka':'&#x9f3;',
'Cambodian riel':'&#x17db;',
'Chinese renminbi':'&#x00a5;',
'Colón':'&#x20a1;',
'Cuban peso':'&#x20b1;',
'Pound':'&#x00a3;',
'Ghanian cedi':'&#x20b5;',
'Indian rupee':'&#x20b9;',
'Iranian rial':'&#xfdfc;',
'Israeli new sheqel':'&#x20aa;',
'Kazakhstani tenge':'&#x20b8;',
'Korean won':'&#x20a9;',
'Lao kip':'&#x20ad;',
'Mongolian tugrik':'&#x20ae;',
'Nigerian naira':'&#x20a6;',
'Paraguayan guarani':'&#x20b2;',
'Thai baht':'&#x0e3f;',
'Ukrainian hryvnia':'&#x20b4;',
'Vietnamese dong':'&#x20ab;',
'Other':''};

var monthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

//createGraph
function createGraph(date, count){
	var ctx = document.getElementById("myChart").getContext("2d");
	var myChart = new Chart(ctx, {
							 type: 'line',
							 data: {
										 labels:date,
									 datasets: [{
											 label: 'No. of counts',
											 data: count,
											 backgroundColor: [
													 'rgba(96,125,139, 0.2)',

											 ],
											 borderColor: [
													 'rgba(96,125,139,1)',

											 ],
											 borderWidth: 1
									 }]
							 },
							 options: {
								 responsive: true,
									 scales: {
											 yAxes: [{
													 ticks: {
															 beginAtZero:true
													 }
											 }]
									 }
							 }
					 });
}

// Initializing module of the app
var cigApp = angular.module('myApp', ['ngRoute','ngSanitize']);

//initialzing the app data and database.
cigApp.run(function($rootScope, $timeout) {
	// Open db or create a new one.
	$rootScope.db = openDatabase('mydb', '1.0', 'Test DB', 5 * 1024 * 1024);
    $rootScope.hasTable = false;
	// Get data function on page load or refresh.
	$rootScope.getCigData = function(d, success) {
		s = [];
		$rootScope.data = '';
        $rootScope.db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM LOGS WHERE cigdate=?', [d], function(tx, results) {
                for (i = 0; i < results.rows.length; i++) {
                    $rootScope.data = {
												'id': results.rows.item(i).id,
                        'name': results.rows.item(i).cigname,
                        'price': results.rows.item(i).cigprice,
                        'count': results.rows.item(i).cigcount,
                        'date': results.rows.item(i).cigdate
					}
				}
		success($rootScope.data);
		$rootScope.hasTable = true;
            }, null);
        });
    }
});

cigApp.service('myService', function(dateFormatFilter) {

	this.getAllData = function(cb) {
		var allData = [];
		var db = openDatabase('mydb', '1.0', 'Test DB', 5 * 1024 * 1024);
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM LOGS', [], function(tx, results) {
				for (i = 0; i < results.rows.length; i++) {
					var data = {
						'id': results.rows.item(i).id,
						'name': results.rows.item(i).cigname,
						'price': results.rows.item(i).cigprice,
						'count': results.rows.item(i).cigcount,
						'date': results.rows.item(i).cigdate
					}
					allData.push(data);
				}
				cb(allData);
			}, null);
		});

		return allData;
	};

	this.loadGraph = function() {
		this.getAllData(function(res){
			var date = res.map(function(r){
				return dateFormatFilter(r.date);
			})

			var count = res.map(function(r){
				return r.count;
			})
			createGraph(date.slice(0,7), count.slice(0,7));
		})
	}
});

cigApp.filter('sumFilter', function() {
     return function(data) {
			var taxTotals = 0;
		for(i=0;i<data.length;i++){
			//console.log(data[i].count);
			 taxTotals = taxTotals + data[i].count;
		}
         return taxTotals;
     };
});

cigApp.filter('moneyFilter', function() {
     return function(data) {
			var moneyTotals = 0;
		for(i=0;i<data.length;i++){
			var money = data[i].price * data[i].count;
			 moneyTotals = moneyTotals + money;
		}
         return moneyTotals;
     };
});

cigApp.filter('reverse', function() {
return function(items) {
	return items.slice().reverse();
};
});
cigApp.filter('dateFormat', function() {
return function(items) {
	var newDateFormat;
		for(i=0;i<items.length;i++){
		var newDate = items.split('/');
		var day = newDate[1];
		var month = monthArray[newDate[0] - 1];
		var year = newDate[2];

		newDateFormat = month+" "+day+", "+year;
	}
	return newDateFormat;
};
});

//defining the controller
cigApp.controller('cigCtrl', function($scope, $rootScope, $route, $window,  $interval, myService, $http) {

	$scope.feedback = "";

	$scope.sendFeedback = function() {
		if($scope.feedback != "") {
				 myApp.showIndicator();
				$http.post("https://dottiest-dump.000webhostapp.com/feedback.php", {feedback:$scope.feedback}, {headers:{'Content-Type':'application/json'}}).then(function(response){
					 myApp.hideIndicator();
					 myApp.alert(response.success,'Success!');
				}).catch(function(error){
					myApp.hideIndicator();
					myApp.alert('Something went wrong.','Error!');
				});
		} else {
			myApp.alert('Write Something.','Alert!');
		}
	}

	$scope.doneWithGuide = function() {
		$scope.appInstalled = true;
	}

	$scope.allData = myService.getAllData(function(res){});

	myService.loadGraph();

	$scope.getAllrecords = function(){
		$scope.allData = myService.getAllData(function(res){});
	}

	//initializing scope variables
	$scope.currencies = countries;
	$scope.cigDate = currentDate.getMonth() + 1 + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
    $scope.isTable = false;
    $scope.cigCount = 0;
    $scope.data;
	$scope.timeNotAvailable = true;

	//numbers from 1 to 100 todays code
	$scope.numbers = [];
      var len=100;
      for(var i=0;i<len;i++) {
		   $scope.numbers.push(i);
	  }

	//setting last smoke time
	$scope.cigTime;
	$scope.countIncreased = false;

	if($scope.cigCount != 0 && window.localStorage.getItem('lastSmoked')){
		$scope.cigTime = window.localStorage.getItem('lastSmoked');
		$scope.timeNotAvailable = false;
	} else {
		$scope.cigTime = 'Not available';
		$scope.timeNotAvailable = true;
		window.localStorage.setItem('gino', 0);
		//window.localStorage.removeItem('lastSmoked');
	}

	$scope.lastSmoked = function(){
		var currentDate = new Date();
		var mins = currentDate.getMinutes();
		var hrs = currentDate.getHours();
		if($scope.cigCount != 0 && $scope.countIncreased) {
			$scope.timeNotAvailable = false;
			console.log(currentDate.getHours());
			if(currentDate.getHours()>=12){
				if(hrs>12){
					hrs = hrs - 12;
				}

				if(mins<=9){
					mins = '0'+mins;
				}
				var time = hrs+':'+mins+' PM';
				$scope.cigTime = time;
				window.localStorage.setItem('lastSmoked', $scope.cigTime);
			} else {
				if(hrs == 0)
				    hrs = 12;
				if(mins<=9){
					mins = '0'+mins;
				}
				var time = hrs+':'+mins+' AM';
				$scope.cigTime = time;
				window.localStorage.setItem('lastSmoked', $scope.cigTime);
			}
		}
	}

	$scope.hrsBefore = '00';
	$scope.minsBefore = '00';
	$scope.fromHrs = false;

	//getting last smoked hours
	$scope.LastSmokedHours = function(){
		//geting current time
		var currentDate = new Date();
		var currentMins = currentDate.getMinutes();
		var currenhrs = currentDate.getHours();

		if(!window.localStorage.getItem('lastSmoked') && $scope.cigTime == 'Not available'){
			window.localStorage.setItem('gino', 0);
			return false;
		}

		var lastSomokedTime = window.localStorage.getItem('lastSmoked');
		lastSomokedTime = lastSomokedTime.split(':');
		var getHours = lastSomokedTime[0];
		var getMinsAmPm = lastSomokedTime[1];
		getMinsAmPm = getMinsAmPm.split(" ");
		var getMins = getMinsAmPm[0];
		var AmPm = getMinsAmPm[1];

		if(AmPm == 'AM'){
		    if(getHours == 12){
				getHours = 0;
			}
			CalcTime(parseInt(getHours), getMins, currenhrs, currentMins);
		} else {
			if(getHours == 12){
				getHours = 0;
			}
			CalcTime(parseInt(getHours)+12, getMins, currenhrs, currentMins);
		}
	}

	function CalcTime(a, b, c, d){
			var getHours = parseInt(a);
			var getLastTotalMins = (getHours*60) + parseInt(b);
			var getCurrentTotalMins = (c*60) + d;
			var minsBefore = getCurrentTotalMins - getLastTotalMins;
			if(minsBefore<10){
				minsBefore = '0'+minsBefore;
			}

			if(minsBefore>59){
				$scope.fromHrs = true;
				$scope.hrsBefore = Math.floor(minsBefore/60);
				minsBefore = minsBefore % 60;
				if(minsBefore<10){
					minsBefore = '0'+minsBefore;
					$scope.minsBefore = minsBefore;
				} else {
					$scope.minsBefore = minsBefore;
				}
			} else { $scope.fromHrs = false;
				$scope.minsBefore = minsBefore;
			}
	}

	$scope.LastSmokedHours();

	$interval(function(){
		$scope.LastSmokedHours();
	}, 1000);

	// defining search and filter variables.
	$scope.selecteddate;
	$scope.dateFound = false;
	$scope.dataNotFound = false;

	//define cigarette name and price variable.
	$scope.cigname = '';
	$scope.cigprice = '';
	$scope.cigCurrency = '';
	$scope.cigTotalAmount = '';

	//check for localstorage data and update the variable.
	if (window.localStorage.getItem('cigName') && window.localStorage.getItem('cigPrice') && window.localStorage.getItem('cigCurrency')) {
		$scope.cigname = window.localStorage.getItem('cigName');
		$scope.cigprice = window.localStorage.getItem('cigPrice');
		$scope.cigCurrency = window.localStorage.getItem('cigCurrency');
	}

	//Refresh data function.
	$scope.refreshData = function() {
		$scope.$apply(function () {
			if (s[0] != undefined && typeof s[0] === 'object') {
				//console.log(typeof s[0]);
				$scope.data = s;
				$scope.cigCount = parseInt($scope.data[0].count);
				window.localStorage.setItem('gino', $scope.cigCount);

			}
			//todays code
			if($scope.cigCount != 0 && window.localStorage.getItem('lastSmoked')){
				$scope.cigTime = window.localStorage.getItem('lastSmoked');
				$scope.timeNotAvailable = false;
			} else {
				$scope.cigTime = 'Not available';
				$scope.timeNotAvailable = true;
				window.localStorage.setItem('gino', 0);
			}
		});
	}

	//Update data function.
	$scope.updatData = function(){
		$rootScope.getCigData($scope.cigDate,function (results){
		s.push(results);
			if (s[0] != undefined && typeof s[0] === 'object') {
				$scope.refreshData();
			}
		});
	}

	//Update data function init
	$scope.updatData();

	//store cigarette name and price function.
	$scope.storeVal = function() {
		if ($scope.cigname == '' || $scope.cigprice == '' || $scope.cigCurrency == '') {
			myApp.alert('Fields are empty', 'Alert!');
			return false;
		} else {
			mainView.router.load({pageName: 'index'});
			$$('.main-page').show();
			window.localStorage.setItem('cigName', $scope.cigname);
			window.localStorage.setItem('cigPrice', $scope.cigprice);
			window.localStorage.setItem('cigCurrency', $scope.cigCurrency);
		}
	}

	//store cigarette name and price function when changed.
	$scope.storeChangeVal =  function() {
		if ($scope.cigname == '' || $scope.cigprice == ''  || $scope.cigCurrency == '') {
			myApp.alert('Fields are empty', 'Alert!');
			return false;
		} else {
			myApp.closeModal('.popup-changeDetails');
			$$('.main-page').show();
			window.localStorage.setItem('cigName', $scope.cigname);
			window.localStorage.setItem('cigPrice', $scope.cigprice);
			window.localStorage.setItem('cigCurrency', $scope.cigCurrency);
		}
	}

	//increment cigarette number when clicked on increment button.
	$scope.incrementCigNo = function() {
		if($scope.cigCount >=100){
			return false;
		}
		$scope.cigCount++;
		$scope.countIncreased = true;
		if (s[0] == undefined || s[0].length == 0) {
			$scope.isTable = true;
		}
	}

	//undo increment if not saved in the db.
	$scope.undoCigCount = function() {
		$scope.countIncreased = false;
		$scope.updatData();
		if (s[0] != undefined && typeof s[0] === 'object') {
			$scope.cigCount = parseInt($scope.data[0].count);
		} else if ($scope.isTable) {
			$scope.cigCount = 0;
			window.localStorage.setItem('gino', 0);
		}
	}

	//Save cigarette data to the database.
	$scope.doneCigCount = function() {
		if($scope.cigCount == 0){
			$scope.timeNotAvailable = true;
			window.localStorage.setItem('gino', 0);
		}
		$rootScope.db.transaction(function(tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id INTEGER PRIMARY KEY , cigname, cigprice INTEGER , cigcount INTEGER, cigdate)');
			tx.executeSql('SELECT COUNT(*) AS c FROM LOGS WHERE cigdate=?', [$scope.cigDate], function(tx, r) {
				if (r.rows.item(0).c > 0) {
					tx.executeSql('UPDATE LOGS SET cigcount=? WHERE cigdate=?', [$scope.cigCount, $scope.cigDate]);
					$scope.isTable = false;
					$scope.updatData();
                } else {
					tx.executeSql('INSERT INTO LOGS (cigname, cigprice, cigcount, cigdate) VALUES (?,?,?,?)', [$scope.cigname, $scope.cigprice, $scope.cigCount, $scope.cigDate]);
					$scope.isTable = false;
					$scope.updatData();
				}
			},
			function(tx, e) {
					myApp.alert("unknown: " + e.message, 'Alert!');
			});
		});
		$scope.lastSmoked(); //todays code
		$scope.LastSmokedHours();
		myService.loadGraph();
		$scope.getAllrecords();
		$scope.countIncreased = false;
	}

	//Delete all records including table and refresh the app.
	$scope.resetCigRecords = function() {
		$rootScope.db.transaction(function(tx) {
			tx.executeSql('DROP TABLE IF EXISTS LOGS');
			$scope.updatData();
			$scope.$apply(function () {
				$scope.cigCount = 0;
			});
		});
		window.localStorage.clear();
		$window.location.reload();
	}

	//reset date field in the popup when popup close.
	$scope.resetDate = function(){
		$scope.selecteddate = undefined;
		$scope.dateFound = false;
		$scope.dataNotFound = false;
	}

	//get records function after selecting the date.
	$scope.getRecords = function() {
		getDate = $scope.selecteddate;
		if($scope.selecteddate === undefined){
			myApp.alert('Please select a date','Alert!');
			$scope.dataNotFound = false;
			return false;
		}
		$rootScope.getCigData(getDate, function(res){
			s.push(res);
			if(s[0] != undefined && typeof s[0] === 'object'){
				$scope.data = s;
				$scope.$apply(function () {
					$scope.dateFound = true;
					$scope.dataNotFound = false;
				});
			} else {
				$scope.$apply(function () {
					$scope.dateFound = false;
					$scope.dataNotFound = true;
				});
			}
			return false;
		});
		if(!$rootScope.hasTable){
			$scope.dataNotFound = true;
		}
	}
});


cigApp.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  };
});
