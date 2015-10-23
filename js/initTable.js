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

function eventOnChange(id) {

}
//stubs-end

function initTable() {

    //Создать таблицу в элементе
    //аргумент - селектор


    /*
     type: 'name',      //обязательно
     edit: true,        //обязательно
     required: false,   //обязательно
     text: 'Название',  //обязательно
     input: {           //не обязательно
         tag : 'input',
         type: 'text'

     },
     visible: false,     //обязательно
     default : 2,        //не обязательно
     change : function(elem){
        console.log(this.type);
     },
     validate : function(elem){
        return true;
     },
     errorMsg : 'ERROR',

     */

    //Добавить ячейку

    createTable('.fast_input').addCell({
        type: 'name',      //обязательно
        edit: true,        //обязательно
        required: false,   //обязательно
        text: 'Название',  //обязательно
        input: {           //не обязательно
            tag : 'input',
            type: 'text'
        },
        validate : function(){
            return true;
        },
        visible: false     //обязательно
    }).addCell({
        type: 'width',
        edit: true,
        required: true,
        text: 'Длинна(w)',
        input: {
            tag : 'input',
            type: 'number'
        },
        visible: false
    }).addCell({
        type: 'height',
        edit: true,
        required: true,
        text: 'Ширина(h)',
        input: {
            tag : 'input',
            type: 'number'
        },
        visible: false
    }).addCell({
        type: 'thickness',
        edit: false,
        required: true,
        text: 'Толщина',
        default : 10,
        visible: false
    }).addCell({
        type: 'count',
        edit: true,
        required: true,
        text: 'Кол-во',
        input: {
            tag : 'input',
            type: 'number'
        },
        visible: false,
        default: 1,
        validate : function (data){
            console.log(data);
            if(data['count'] < 1){
                return false;
            }
        }
        //validate : function(elem, row){
        //    //console.log(row);
        //    console.log(width.getElem(row).html());
        //    return elem.find('input').val() > 0;
        //}
    }).addCell({
        type: 'staple',
        edit: true,
        required: true,
        text: 'Кратность',
        input: {
            tag : 'input',
            type: 'number'
        },
        visible: false
    }).addCell({
        type: 'test',
        edit: true,
        required: true,
        text: 'test',
        input: {
            tag : 'input',
            type: 'checkbox',
            attrs :{
                checked : 'checked'
            }
        },
        visible: true,
        default : 'on',
        validate : function (data){
            console.log(data['test']);
            return data['test'];
        }
    }).build();


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

            var wid = data['width'] == '' ? 0 : parseFloat(data['width'].replace(',', '.')).toFixed(1);

            var hei = data['height'] == '' ? 0 : parseFloat(data['height'].replace(',', '.')).toFixed(1);

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
            } else {
                //showMsg('ERROR');
                return false;
            }


        },

        width: function (data) {

            return checks.widthHeight(data, false);
            //var maxW;
            //var maxH;
            //
            //var staple = data['staple'];
            //if(staple > 1){
            //    maxW = maxWidth - indenCrosslinking;
            //    maxH = maxHeight - indenCrosslinking;
            //} else {
            //    maxW = maxWidth;
            //    maxH = maxHeight;
            //}
            //var texture = data['texture'];
            //
            //var wid = data['width'] == '' ? 0 : parseFloat(data['width'].replace(',', '.')).toFixed(1);
            //
            //var hei = data['height'] == '' ? 0 : parseFloat(data['height'].replace(',', '.')).toFixed(1);
            //
            ////var minW = hei != 0 ? (hei < maxH && hei > minHeight ? minWidth : minHeight) : minWidth;
            //
            //var minW = minWidth;
            //var minH = minHeight;
            //
            //
            //
            //if(wid >= minW && wid <= maxW && (hei == 0 || hei <= maxHeight && hei >= Math.max(minH, minW))){
            //    return true;
            //} else if(!texture) {
            //    if(hei == 0){
            //        if(wid <= maxH && wid >= Math.min(minH, minW)){
            //            return true;
            //        } else {
            //            return false;
            //        }
            //    } else {
            //        if(hei <= maxW && wid <= maxH && wid >= (hei > Math.max(minH, minW) ? Math.min(minH, minW) : Math.max(minH, minW))){
            //            return true;
            //        } else {
            //            return false;
            //        }
            //    }
            //} else {
            //    //showMsg('ERROR');
            //    return false;
            //}


        },

        height: function (data) {
            return checks.widthHeight(data, true);
            //var maxW;
            //var maxH;
            //
            //var staple = data['staple'];
            //if(staple > 1){
            //    maxW = maxWidth - indenCrosslinking;
            //    maxH = maxHeight - indenCrosslinking;
            //} else {
            //    maxW = maxWidth;
            //    maxH = maxHeight;
            //}
            //var texture = data['texture'];
            //
            //var hei = data['height'] == '' ? 0 : parseFloat(data['height'].replace(',', '.')).toFixed(1);
            //
            //var wid = data['width'] == '' ? 0 : parseFloat(data['width'].replace(',', '.')).toFixed(1);
            //
            //var minW = minWidth;
            //var minH = minHeight;
            //
            //
            //if(hei >= minH && hei <= maxH && (wid == 0 || wid <= maxWidth && wid >= Math.max(minH, minW))){
            //    return true;
            //} else if(!texture) {
            //    if(wid == 0){
            //        if(hei <= maxW && hei >= Math.min(minH, minW)){
            //            return true;
            //        } else {
            //            return false;
            //        }
            //    } else {
            //        if(wid <= maxH && hei <= maxW && hei >= (wid > Math.max(minH, minW) ? Math.min(minH, minW) : Math.max(minH, minW))){
            //            return true;
            //        } else {
            //            return false;
            //        }
            //    }
            //} else {
            //    //showMsg('ERROR');
            //    return false;
            //}

        },

        thickness: function (data) {

        },

        count: function (data) {
            if(parseInt(data.count) != data.count && data.count < 1){
                //showMsg("Количество должно быть целым, а не " + data.count);
                return false;
            }
        }
    };


}