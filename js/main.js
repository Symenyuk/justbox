'use strict';

//function toggleClick
(function ($) {
    $.fn.clickToggle = function (func1, func2) {
        var funcs = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(function () {
            var data = $(this).data();
            var tc = data.toggleclicked;
            $.proxy(funcs[tc], this)();
            data.toggleclicked = (tc + 1) % 2;
        });
        return this;
    };
}(jQuery));

var auth2 = {};
var helper = (function () {
    return {
        /**
         * Hides the sign in button and starts the post-authorization operations.
         *
         * @param {Object} authResult An Object which contains the access token and
         *   other authentication information.
         */
        onSignInCallback: function (authResult) {
            if (authResult.isSignedIn.get()) {
                $('#gConnect').hide('slow');
                helper.profile();
            } else {
                if (authResult['error'] || authResult.currentUser.get().getAuthResponse() == null) {
                    // There was an error, which means the user is not signed in.
                    // As an example, you can handle by writing to the console:
                    console.log('There was an error: ' + authResult['error']);
                }
                $('#gConnect').show();
            }
            console.log('authResult', authResult);
        },
        /**
         * Calls the OAuth2 endpoint to disconnect the app for the user.
         */
        disconnect: function () {
            // Revoke the access token.
            auth2.disconnect();
        },
        /**
         * Gets and renders the currently signed in user's profile data.
         */
        profile: function () {
            gapi.client.plus.people.get({
                'userId': 'me'
            }).then(function (res) {
                var profile = res.result;
                console.log('success', profile);

                // TODO add user saving and session

                // $.ajax({
                //     url: '/',
                //     method: 'post',
                //     dataType: "json",
                //     data: profile,
                //     success: function (data) {
                //     }
                // });

            }, function (err) {
                var error = err.result;
                console.error(error);
            });
        }
    };
})();
/**
 * Handler for when the sign-in state changes.
 *
 * @param {boolean} isSignedIn The new signed in state.
 */
var updateSignIn = function () {
    console.log('update sign in state');
    if (auth2.isSignedIn.get()) {
        console.log('signed in');
        helper.onSignInCallback(gapi.auth2.getAuthInstance());
    } else {
        console.log('signed out');
        helper.onSignInCallback(gapi.auth2.getAuthInstance());
    }
}

/**
 * This method sets up the sign-in listener after the client library loads.
 */
function startApp() {
    gapi.load('auth2', function () {
        gapi.client.load('plus', 'v1').then(function () {
            gapi.signin2.render('signin-button', {
                scope: 'https://www.googleapis.com/auth/plus.login',
                fetch_basic_profile: false
            });
            gapi.auth2.init({
                fetch_basic_profile: false,
                scope: 'https://www.googleapis.com/auth/plus.login'
            }).then(
                function () {
                    console.log('init');
                    auth2 = gapi.auth2.getAuthInstance();
                    auth2.isSignedIn.listen(updateSignIn);
                    auth2.then(updateSignIn);
                });
        });
    });
}


$(document).ready(function () {
    // home carousel
    $(".home_carousel").owlCarousel({
        items: 1,
        nav: true,
        dots: true,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true
    });

    // often ordered carousel
    $(".often_ordered_carousel").owlCarousel({
        items: 4,
        nav: true,
        dots: false,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true,
        margin: 20,
        responsive: {
            0: {
                items: 1,
            },
            480: {
                items: 2,
            },
            768: {
                items: 3,
            },
            1380: {
                items: 4,
            }
        }
    });

    // rewiews carousel
    $(".reviews_carousel").owlCarousel({
        items: 1,
        nav: true,
        dots: false,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true
    });

    $('.btn_change_pass').on('click', function () {
        $(this).parent().parent().toggleClass('active');
    });

    $('#personal-area .history_orders .short_info').on('click', function () {
        $(this).parent().toggleClass('active');
    });

    $('#details-product .show_hide').on('click', function () {
        $(this).parent().parent().toggleClass('active');
    });

    // search
    var $search = $('nav .search');
    var $container = $('#search-form');
    $search.on('click', function () {
        $(this).addClass('active');
    });
    $(document).mouseup(function (e) {
        if (($container.has(e.target).length === 0) && ($search.val() == 0)) {
            $container.children('.search').removeClass('active');
        }
    });


    $('button.buy_now').click(function () {
        var id = $(this).data('id'),
            qty = $('.count_product .counter input').val() || 1,
            boxType = $('#material').val() || 1,
            price = boxType == 1 ? $('.price.wooden .price').html() : $('.price.craft .price').html();

        if (price == undefined) {
            price = $('.price .box_price').html();
        }

        var data = {id: id, qty: qty, boxType: boxType, price: price};

       addBox(data);
    });

    function addBox(item) {
        $.ajax({
            url: '/cart/add',
            method: 'post',
            dataType: "json",
            data: item,
            success: function (data) {
                if (data.success) {
                    var qty = $('.cart_qty').html() || 0,
                        moneyAmount = $('.money_amount').html() || 0;

                    $('.cart_qty').html(+qty + 1);
                    $('.money_amount').html(+moneyAmount + +item.price);
                    $.notify("Товар додано у кошик", "success");
                }
            }
        });
    }

    $('select[name="box-type"]').on('change', function () {
        if ($(this).val() == 1) {
            $('.price.craft').hide();
            $('.old_price.craft').hide();
            $('.price.wooden').show();
            $('.old_price.wooden').show();
        } else {
            $('.price.craft').show();
            $('.old_price.craft').show();
            $('.price.wooden').hide();
            $('.old_price.wooden').hide();
        }
    });

    $('#basket .cart_item .count .plus').on('click', function () {
        var count = $(this).parent().find('.count_pr'),
            price = $(this).parent().parent().find('.price_pr').html();

        if (count.val() > 0) {
            count.val(+count.val() + 1);
        }

        var qty = $('.cart_qty').html() || 0,
            amount = (+($('.money_amount').html() || 0) + +price);

        $('.cart_qty').html(+qty + 1);
        $('.money_amount').html(amount);
        $('.result_list_prod .price').html(amount)
    });

    $('#basket .cart_item .count .minus').on('click', function () {
        var count = $(this).parent().find('.count_pr'),
            price = $(this).parent().parent().find('.price_pr').html();

        if (count.val() > 1) {
            count.val(+count.val() - 1);

            var qty = $('.cart_qty').html() || 0,
                amount = (+($('.money_amount').html() || 0) - +price);

            $('.cart_qty').html(+qty - 1);
            $('.money_amount').html(amount);

            $('.result_list_prod .price').html(amount)
        }
    });

    $('#basket .result_list_prod .checkout').click(function () {
        var data = {};

        $.each($('.list_prod .cart_item'), function (i, item) {
            var id = $(item).data('id'),
                type = $(item).find('select[name="box-type"]').val(),
                qty = $(item).find('.count_pr').val();

            if (!data[id]) {
                data[id] = {};
            }

            if (!data[id][type]) {
                data[id][type] = qty;
            } else {
                data[id][type] = +data[id][type] + +qty;
            }
        });

        $.ajax({
            url: '/order',
            method: 'post',
            dataType: "json",
            data: data,
            success: function (data) {
                if (data.success) {
                    window.location.href = data.url;
                }
            }
        });
    });

    $('#basket .list_prod .delete_box').click(function () {
        var boxDiv = $(this).closest('.cart_item'),
            id = boxDiv.data('id'),
            type = boxDiv.data('type');

        $.ajax({
            url: '/cart/delete',
            method: 'post',
            dataType: "json",
            data: {id: id, type: type},
            success: function (data) {
                if (data.success) {
                    boxDiv.remove();
                    var qty = $('.cart_qty').html() || 0;

                    if (qty < 1) {
                        $('.cart_qty').html(0);
                    } else {
                        $('.cart_qty').html(+qty - data.minus_qty);
                        var moneyAmount = $('.money_amount').html() || 0;

                        $('.money_amount').html(+moneyAmount - data.minus_price);
                    }
                }
            }
        });
    });

    $('.delivery select[name="ShippingType"]').on('change', function() {
        var shippingType = $(this).val();

        if (shippingType == 1) {
            $('.box_input.home').hide();
            $('.box_input.np.delivery').show();
        } else if (shippingType == 3) {
            $('.box_input.home').show();
            $('.box_input.np.delivery').hide();
        } else {
            $('.box_input.home').hide();
            $('.box_input.np.delivery').hide();
        }
    });

    $('.filter_content .apply_filter').on('click', function () {
        var min = $('#minCost').val(),
            max = $('#maxCost').val();

        var url = window.location.pathname + '?min=' + min + '&max=' + max;
        document.location = url;
    });
    
    $('#forgotPass').on('click', function () {
        $('.forgotForm').show();
        $('.loginForm').hide();
        $('#loginBtn').show();
        $('#forgotPass').hide();
    });

    $('#loginBtn').on('click', function () {
        $('.forgotForm').hide();
        $('.loginForm').show();
        $('#loginBtn').hide();
        $('#forgotPass').show();
    });

    $(function () {
        $('#my-slider').sliderPro({
            width: 895,
            height: 705,
            orientation: 'vertical', // horizontal
            arrows: true,
            buttons: false,

            thumbnailsPosition: 'right',
            thumbnailPointer: true,
            thumbnailArrows: true,
            thumbnailWidth: 160, // d
            thumbnailHeight: 150, // d
            largeSize: 1024, // d
            mediumSize: 768, // d
            smallSize: 480, //d

            breakpoints: {
                1024: {
                    width: 768,
                    thumbnailWidth: 110, // d
                    thumbnailHeight: 100, // d
                    orientation: 'horizontal', // horizontal
                },
                768: {
                    orientation: 'horizontal',
                    thumbnailsPosition: 'bottom',
                },
                480: {
                    orientation: 'horizontal',
                    thumbnailsPosition: 'bottom',
                }
            }
        });
    });
    // pop-up
    $(function () {
        var
            $buttonSignIn = $('.sing_in'),
            $buttonSignUp = $('.sing_up'),
            $signInWindow = $('#sing-in-window'),
            $signUpWindow = $('#sing-up-window');

        $signInWindow.dialog({
            autoOpen: false,
            width: $(window).width() > 768 ? 768 : 'auto',
            modal: true,
            open: function () {
                $(document.body).css({overflow: "hidden"})
            },
            close: function () {
                $(document.body).css({overflow: "scroll"})
            },
        });

        //Open-dialog
        $buttonSignIn.on('click', function () {
            $signInWindow.dialog('open');
        });

        //Close-dialog
        $('body').on('click', '.ui-widget-overlay', function () {
            $signInWindow.dialog('close');
        });


        $signUpWindow.dialog({
            autoOpen: false,
            width: $(window).width() > 768 ? 768 : 'auto',
            modal: true,
            open: function () {
                $(document.body).css({overflow: "hidden"})
            },
            close: function () {
                $(document.body).css({overflow: "scroll"})
            },
        });

        //Open-dialog
        $buttonSignUp.on('click', function () {
            $signUpWindow.dialog('open');
        });

        //Open-dialog
        $('#notRegYet').on('click', function () {
            $signInWindow.dialog('close');
            $signUpWindow.dialog('open');
        });

        //Open-dialog
        $('#alreadyHasAcc').on('click', function () {
            $signUpWindow.dialog('close');
            $signInWindow.dialog('open');
        });

        //Close-dialog
        $('body').on('click', '.ui-widget-overlay', function () {
            $signUpWindow.dialog('close');
        });

    });


    $('.btn_mobile_nav').on('click', function () {
        $(this).toggleClass('_ico');
        $('nav').toggleClass('menu-visible');
        $('nav').removeClass('search-visible');
        $('.mobile_sign').removeClass('sign-visible');
    });
    // $('.btn_mobile_search').on('click', function () {
    //     $('nav').toggleClass('search-visible');
    //     $('nav').removeClass('menu-visible');
    //     $('.mobile_sign').removeClass('sign-visible');
    //     $('.btn_mobile_nav').removeClass('_ico');
    // });
    $('.btn_mobile_sign').on('click', function () {
        $('.mobile_sign').toggleClass('sign-visible');
        $('nav').removeClass('menu-visible');
        $('nav').removeClass('search-visible');
        $('.btn_mobile_nav').removeClass('_ico');
    });

    // filters (shop page)
    var bntFilter = $('.btn_filter'),
        ctnFilter = $('.wrapper_filter > .filter_content');
    bntFilter.clickToggle(function () {
        $(this).addClass('open');
        ctnFilter.addClass('show');
    }, function () {
        $(this).removeClass('open');
        ctnFilter.removeClass('show');
    });


    // bntFilter
    $("#slider").slider({
        min: 0,
        max: 5000,
        values: [0, 5000],
        range: true,
        stop: function (event, ui) {
            $("input#minCost").val($("#slider").slider("values", 0));
            $("input#maxCost").val($("#slider").slider("values", 1));
        },
        slide: function (event, ui) {
            $("input#minCost").val($("#slider").slider("values", 0));
            $("input#maxCost").val($("#slider").slider("values", 1));
        }
    });
    $("input#minCost").change(function () {
        var value1 = $("input#minCost").val();
        var value2 = $("input#maxCost").val();
        if (parseInt(value1) > parseInt(value2)) {
            value1 = value2;
            $("input#minCost").val(value1);
        }
        $("#slider").slider("values", 0, value1);
    });

    $("input#maxCost").change(function () {
        var value1 = $("input#minCost").val();
        var value2 = $("input#maxCost").val();
        if (value2 > 1000) {
            value2 = 1000;
            $("input#maxCost").val(1000)
        }
        if (parseInt(value1) > parseInt(value2)) {
            value2 = value1;
            $("input#maxCost").val(value2);
        }
        $("#slider").slider("values", 1, value2);
    });

    $(document).ready( function(){
        setTimeout(function(){
            // if($('#DIV_ID').children().length === 0) {
                grecaptcha.render('g-recaptcha')
            // }
        }, 500);
    });

}); // end document-ready
