// Initialize your app
var myApp = new Framework7({
	material: true, //enable Material theme
	smartSelectOpenIn: 'page',
	smartSelectSearchbar:true
});
//myfunction();
// Export selectors engine
var $$ = Dom7;

/* Initialize views */
var mainView = myApp.addView('.view-main', {
  dynamicNavbar: true,
  domCache: true //enable inline pages
});

// Init slider and store its instance in mySwiper variable
var mySwiper = myApp.swiper('.swiper-container', {
	 pagination:'.swiper-pagination'
});


if(window.localStorage.getItem('cigName') && window.localStorage.getItem('cigPrice')) {
		myApp.showPreloader();
 	  $$('.appInstalled').remove();
		mainView.router.load({pageName: 'index'});
		$$('.main-page').show();
	} else {
		$$('.appInstalled').css("visibility","visible");
		mainView.router.load({pageName: 'details'});
	}

var today =new Date();

var calendarDateFormat = myApp.calendar({
    input: '#calendar-date-format',
    dateFormat: 'm/d/yyyy',
	onOpen: function() {
		if(calendarDateFormat.value === 'NaN/NaN/NaN'){
		calendarDateFormat.setValue([today]);
		} else {
			calendarDateFormat.setValue(calendarDateFormat.value);
		}
	},
});

$$('.resetDP').on('click', function(){
	calendarDateFormat.setValue([today]);
});


$$( ".cig_brand, .cig_price" ).on( 'paste',function(){
   var obj = this;
   setTimeout(function()
   {
	  var data = $$(obj).val();
	  var dataFull = data.replace(/[^\w\s]/gi, '');
	  $$(obj).val(dataFull);
   },0);
});

$$('.confirm-ok').on('click', function () {
    myApp.confirm('Delete all Smoke records','Are you sure?', function () {
		angular.element($$('.reset-cig-records')).scope().resetCigRecords();
    });
});

document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
	var page = $$('.view-main').attr('data-page');
	if(page == 'index'){
		if($$('.panel-right').hasClass('active')){
			$$('.close-panel.close-sidebar').click();
		} else {
			navigator.app.exitApp();
		}
	}
	$$(".back").click();
}

jQuery(document).ready(function($){
	var liPos = 0;
	var liWidth = $('.swiper li').width();
    var liLength = $('.swiper li').length;
	$('.swiper li').eq(0).addClass('active');
	var ulPos = 78;
	$('.swiper').css('width', liWidth*liLength+100+'px');

	$('.custom-float').on('click', function(){
		if(liPos == 100){
			return false;
		}
		$('.swiper').css('opacity', 1);
		$('.total-cig-num').css('opacity', 0);
        ulPos -=55;
        //console.log(ulPos);
		liPos++;
		$('.swiper').css('left',ulPos+'px');
		$('.swiper li').removeClass('active');
		$('.swiper li').eq(liPos).addClass('active');
	});

	$('.swiper').css('opacity', 0);
	$('.total-cig-num').css('opacity', 1);
	var a = 0;
	var interval = setInterval(function(){
					var savedCig = window.localStorage.getItem('gino');

					savedCig = parseInt(savedCig);

					var ulPosInit = 78;
					if(savedCig>0){
						ulPosInit-= (55*savedCig);
						$('.swiper li').removeClass('active');
						$('.swiper').css('left',ulPosInit+'px');
						$('.swiper li').eq(savedCig).addClass('active');
						liPos = savedCig;
						ulPos = ulPosInit;
						myApp.hidePreloader();
						clearInterval(interval);
					}
					a++;
					if(a ==10){
						myApp.hidePreloader();
						clearInterval(interval);
					}
			},200);

	$('.undo-btn').on('click', function(){
		var savedCig = window.localStorage.getItem('gino');
		savedCig = parseInt(savedCig);
		var ulPosInit = 78;

			ulPosInit-= (55*savedCig);
			$('.swiper li').removeClass('active');
			$('.swiper').css('left',ulPosInit+'px');
			$('.swiper li').eq(savedCig).addClass('active');
			liPos = savedCig;
			ulPos = ulPosInit;
			setTimeout(function(){
				$('.swiper').css('opacity', 0);
				$('.total-cig-num').css('opacity', 1);
			}, 375);
	});

	$('.done-btn').on('click', function(){
		$('.swiper').css('opacity', 0);
		$('.total-cig-num').css('opacity', 1);
		$('#cig-num-done-hidden').html(parseInt($('#cig-num').html()));
	});

});
