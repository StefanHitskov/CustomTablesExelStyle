/**
 * Created by Хицков Стефан on 22.10.2015.
 */

//stubs
var maxWidth = 2800;
var minWidth = 100;
var maxHeight = 2070;
var minHeight = 50;
var thickness = 18;
var maxThickness = 60;
var indenCrosslinking = 5;
var minThicknessForStaple = 10;

function eventOnChange() {
    console.log('eventOnChange');
}
//stubs-end

function initTable() {


    var checks = {

        widthHeight: function(data, height){
            var maxW;
            var maxH;

            var staple = data['staple'];
            if(staple > 1){
                maxW = maxWidth - indenCrosslinking;
                maxH = maxHeight - indenCrosslinking;
            } else {
                maxW = maxWidth;
                maxH = maxHeight;
            }
            var texture = data['texture'];

            var wid = data['width']  ?  parseFloat(data['width'].replace(',', '.')).toFixed(1) : 0;

            var hei = data['height']  ?  parseFloat(data['height'].replace(',', '.')).toFixed(1) : 0;

            //var minW = hei != 0 ? (hei < maxH && hei > minHeight ? minWidth : minHeight) : minWidth;

            var minW = minWidth;
            var minH = minHeight;

            //Если делаем проверку "высоты" - меняем все занчения местами
            if(height){
                //Меняем минимальные
                minH = minWidth;
                minW = minHeight;

                //Меняем максимальные
                var tmp = maxW;
                maxW = maxH;
                maxH = tmp;

                //Меняем актуальные
                tmp = wid;
                wid = hei;
                hei = tmp;

            }

            if(wid >= minW && wid <= maxW && (hei == 0 || hei <= maxHeight && hei >= Math.max(minH, minW))){
                return true;
            } else if(!texture) {
                if(hei == 0){
                    if(wid <= maxH && wid >= Math.min(minH, minW)){
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if(hei <= maxW && wid <= maxH && wid >= (hei > Math.max(minH, minW) ? Math.min(minH, minW) : Math.max(minH, minW))){
                        return true;
                    } else {
                        return false;
                    }
                }
            };
            eventOnChange();
        },

        width: function (data) {
            return checks.widthHeight(data, false);
        },

        height: function (data) {
            return checks.widthHeight(data, true);
        },

        thickness: function (data) {
            eventOnChange();
        },

        count: function (data) {
            //console.log(data['count'] < 1);
            if(data['count'] < 1 || parseInt(data['count']) != data['count']){
                //showMsg("Количество должно быть целым, а не " + data.count);
                return false;
            }
            eventOnChange();
        }

    };


    //Создать таблицу в элементе
    //аргумент - селектор

    createTable('.fast_input').addCell({
        type: 'caption',      //обязательно
        edit: true,        //обязательно
        required: false,   //обязательно
        text: 'Название',  //обязательно
        input: {           //не обязательно
            tag : 'input',
            type: 'text'
        }

    }).addCell({
        type: 'width',
        edit: true,
        required: true,
        text: 'Длинна(w)',
        input: {
            tag : 'input',
            type: 'number'
        },
        validate : checks['width'],

    }).addCell({
        type: 'height',
        edit: true,
        required: true,
        text: 'Ширина(h)',
        input: {
            tag : 'input',
            type: 'number'
        },
        validate : checks['height'],
    }).addCell({
        type: 'thickness',
        edit: false,
        required: true,
        text: 'Толщина',
        default : thickness

    }).addCell({
        type: 'count',
        edit: true,
        required: true,
        text: 'Кол-во',
        input: {
            tag : 'input',
            type: 'number'
        },
        default: 1,
        validate : checks['count']

    }).addCell({
        type: 'staple',
        edit: true,
        required: true,
        text: 'Кратность',
        input : {
            tag : 'select',
            options : ['1', '2', '3'] // подсчитать
        },
        validate : function (data){
            var st = data['staple'];
            data['thickness'] = (st * thickness);
            console.log(data);
            //console.log(st * thickness);
            eventOnChange();
        }
    }).addCell({
        type: 'top',
        edit: true,
        required: false,
        text: 'В',
        input : {
            tag : 'select',
            options : ['1', '2', '3'] // подсчитать
        },


    }).addCell({
        type: 'bottom',
        edit: true,
        required: false,
        text: 'Н',
        input : {
            tag : 'select',
            options : ['1', '2', '3'] // подсчитать
        },


    }).addCell({
        type: 'left',
        edit: true,
        required: false,
        text: 'Л',
        input : {
            tag : 'select',
            options : ['1', '2', '3'] // подсчитать
        },


    }).addCell({
        type: 'right',
        edit: true,
        required: false,
        text: 'П',
        input : {
            tag : 'select',
            options : ['1', '2', '3'] // подсчитать
        },


    }).addCell({
        type: 'texture',
        edit: true,
        required: true,
        text: 'Текстура',
        input : {
            tag : 'input',
            type : 'checkbox',

            attrs : {
                checked : 'checked'
            }
        }

    }).delete(function(idx){

        console.log(idx);

    }).change(function(data){

        console.log(data);

    }).build();


    //var o = {
    //    '0' : {
    //        'name' : 'name',
    //        'dsde' : 'de'
    //    },
    //    '1' : {
    //
    //    }
    //}



}