$(document).ready(function(){
    $("#email").click(function(){
        $("#myModal").modal();
    });
    $('#introduction').animate({'opacity':'1'},1800);
    $(window).scroll( function(){
        /* Check the location of each desired element */
        $('.hideme').each( function(i){

            var bottom_of_object = $(this).position().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height();
            /* If the object is completely visible in the window, fade it it */
            //i used +400 for an offset to make it appear a little sooner so it appears AS you scroll
            if( (bottom_of_window+400) > bottom_of_object ){
                $(this).animate({'opacity':'1'},1000);
            }
        });
    });
});
