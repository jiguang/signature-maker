/*
 * @desc: Signature Tool for ECD
 * @author: laserji
 * @email: jiguang1984#gmail.com
 * @date: 2012-09-21
 */

$(function(){

var sign = {
    init: function(){
        if(this.isSupported()){
            // get canvas & context
            this.canvas = $('#canvas')[0];
            this.context = this.canvas.getContext('2d');

            // default avatar
            this.avatar_url = 'avatar/1.jpg';

            // init bg offset
            this.w = 509;
            this.h = 100;

            this.bind();
        }
    },
    isSupported: function(){
        try{
            document.createElement('canvas').getContext('2d');
            return true;
        }catch(e){
            return false;
        }
    },
    drawText: function (context, font, color, text, x, y){
        context.font = font;
        context.fillStyle = color;

        if(text == 'ID'){  // ID needs shift right by 3px
            x+=3;
        }
        context.fillText(text, x, y);
        return context.measureText(text).width;
    },
    paint: function (context, type, text){
        var font_1 = '26px GothamRoundedBook',
            font_2 = '12px GothamRoundedBook',
            font_3 = '12px "Microsoft Yahei"',
            color_1 = '#393939',
            color_2 = '#ffffff';

        // if job type is 'others', then hide the pop
        if(text == 'Other'){
            this.isOthers = true;
        }

        // parameter determined by design(PSD)
        switch(type){
            case 'name': this.nameLeft = this.drawText(context, font_1, color_1, text, 220, 37);
                break;
            case 'job':
                this.drawText(context, font_2, color_2, text, this.nameLeft + 229, 20);
                break;
            case 'sitting': this.drawText(context, font_2, color_1, text, 237, 63);
                break;
            case 'mobile': this.drawText(context, font_2, color_1, text, 304, 63);
                break;
            case 'qq': this.drawText(context, font_2, color_1, text, 416, 63);
                break;
            case 'character': this.drawText(context, font_3, color_1, '" '+text+' "', 220, 85);
                break;
            default: console.log('Error: No such type!');
        }
    },
    imageSelected: function(myFiles) {
        var that = this;

        for (var i = 0, f; f = myFiles[i]; i++) {
            var imageReader = new FileReader();
            imageReader.onload = (function(aFile) {
                return function(e) {
                    $('#custom').html(['<img id="custom_avatar" src="', e.target.result,'" title="', aFile.name, '"/>'].join(''));
                    $('.custom_wrap').addClass('cur');

                    $('#custom_avatar').load(function(){
                        that.avatar_url = e.target.result;
                        that.avatar_width = $('#custom img').width();
                        that.avatar_height = $('#custom img').height();

                        $(this).height() >= $(this).width() ?
                            $(this).width(90) :  $(this).height(90);
                    });
                };
            })(f);
            imageReader.readAsDataURL(f);
        }
    },
    bind: function(){
        var that = this;

        // handle job type
        $('#job').click(function(e){
            $('#job_list').show();
            e.stopPropagation();
            e.preventDefault();
        });

        $('body').click(function(){
            $('#job_list').hide();
        });

        $('#mod_job li').click(function(){
            $('#job').val($(this).html());
            $('#job_list').hide();
        });

        // handle avatar
        $('.default-avatar .outter').click(function(){
            that.avatar_url = $(this).find('img').attr('src');
            $(this).siblings().removeClass('cur').end().addClass('cur');
        });

        $('#custom').click(function(){
            $('#file').click();

            $('#file').change(function(){
                that.imageSelected($(this)[0].files);
            });
        });

        $('#custom')[0].ondrop = function(e){
            that.imageSelected(e.dataTransfer.files);
            e.stopPropagation();
            e.preventDefault();
        };

        $('#submit').click(function(e){
            e.preventDefault();
            that.combine();
        });
    },
    combine: function(){
        var that = this;

        // load avatar
        $(new Image()).attr('src', this.avatar_url).load(function () {

            if($('#custom img')[0]){
                // custom avatar was selected
                that.avatar_height >= that.avatar_width ?
                    that.context.drawImage($(this)[0], 86, 2, 90, that.avatar_height*90/that.avatar_width) :
                    that.context.drawImage($(this)[0], 86, 2, that.avatar_width*90/that.avatar_height, 90);

            }else{
                // use default avatar
                that.context.drawImage($(this)[0], 86, 2, 90, 90);
            }

            // load bg
            $(new Image()).attr('src','img/sample_sign.png').load(function () {
                that.context.drawImage($(this)[0], 0, 0, that.w, that.h);

                // load pop
                $(new Image()).attr('src','img/pop.png').load(function () {

                    // paint text, then compute the position of pop
                    $('#inputList .type').each(function(){
                        that.paint(that.context, $(this).attr('name'), $(this).val());
                    });

                    // if not other job type
                    if(!that.isOthers){
                        that.context.drawImage($(this)[0], that.nameLeft + 226, 3, 24, 26);

                        // paint job type
                        that.paint(that.context, 'job', $('#job').val());
                    }
                });
            });
        });

        // create image; need a moment
        setTimeout(function(){
            $('#canvas').hide();
            $('#signImage').attr('src', that.canvas.toDataURL()).show();
            $('#tip').show();
            $('#preview').show();
        },500);

    }
};

    sign.init();
});




