//Инициализация
function createTable(selector) {


    var table;


    return new function () {
        var cellsArray = [];

        var onDelete = function () {

        };

        var onChange = function () {

        };

        this.addCell = function (cell) {
            cellsArray.push(cell);
            return this;
        };

        this.delete = function (func) {
            if (typeof func == 'function') {
                onDelete = func;
            }
            return this;
        };

        this.change = function (func){
            if (typeof func == 'function') {
                onChange = func;
            }
            return this;
        };

        this.build = function () {
            table = new Table(selector, cellsArray);
            table.onDelete = onDelete;
            table.onChange = onChange;
            table.init();
            setEvents();
            //Убираем возможность повторной инициализации
            this.addCell = stub;
            this.init = stub;
        };

        function stub() {
            throw new Error('Таблица уже создана');
        }

    };

    function setEvents() {
        setListeners();
        //setActions();

    }

    function setListeners() {
        //Выбор мышкой
        table.addMouseListener(function (event, elem) {
            //if (!elem.isEdit) {
            //if (!elem.isEdit) {
            event.preventDefault();
                if (table.selected == elem) {
                    table.action(event, elem);
                } else {
                    var success = table.setSelection(elem);
                }

            return false;
            //}

            //if (success || success == undefined) {
            //    //elem.action(event);
            //    table.action(event, elem);
            //}
            //}
        });

        ////Перемещение
        table.addKeyListener(function (event, elem) {
            if(!elem) return;
            if (elem.isEdit) return;

            if(event.keyCode >= 37 && event.keyCode <= 40){
                event.preventDefault();
                //event.preventBubble();
                //event.stopPropagation();
                switch (event.keyCode) {
                    case 37:
                        table.moveTo('left');
                        break;
                    case 38:
                        table.moveTo('up');
                        break;
                    case 39:
                        table.moveTo('right');
                        break;
                    case 40:
                        table.moveTo('down');

                        break;
                }
            }

        });

        //переход по ctrl + enter
        table.addKeyListener(function (event, elem) {
            if (event.ctrlKey && event.keyCode === 13) {

                var success = table.setSelection(elem);
                if (success || success == undefined) {
                    if (elem.coords().top() == table.rows.length - 1) {
                        table.addRow();
                    }
                    table.moveTo('down');
                    table.moveToStart();
                }

            }
        });

        //enter
        table.addKeyListener(function (event, elem) {
            if (event.keyCode == 13 && !event.ctrlKey) {

                table.action(event, elem);
                //elem.action(event);
            }
        });
        table.addKeyListener(function(event, elem){
            if(event.keyCode == 46){
                elem.row.delete();
            }
            //console.log(event.keyCode);
        })
    }

    function Table(selector, cells) {

        this.keyControllers = [];
        this.mouseControllers = [];
        this.inputActions = [];
        var self = this;


        this.html = $('<table border="1" class="mi-mi-table"></table>');
        this.rows = [];
        this.selected = null;
        this.cells = cells;


        this.html.on('click', 'td', function (event) {
            var td = $(this);
            var left = td.index();
            var top = td.parent().index();
            var elem = self.get(top - 1, left - 1);
            self.notifyAll(event, elem);
        });

        $('body').keydown(function (event) {
            self.notifyAll(event, self.selected);
        });

        Table.prototype.init = function () {

            this.cells.push({
                type: 'delete',
                edit: true,
                required: false,
                text: "Удалить",
                input: {
                    tag: 'input',
                    type: 'button'
                },
                action: 'delete',
                visible: true,
                default: 'Del',
                validate: function (data) {

                    self.rows[data['index']].delete();

                }
            });

            var row = $('<tr></tr>');
            row.append('<th>№</th>');
            this.html.append(row);

            for (var i = 0; i < cells.length; i++) {
                row.append(createTh(cells[i]));
            }


            $(selector).append(this.html);

            this.addRow();
            //selected = rows[0].getElem(0);
            this.setSelection(this.rows[0].getElem(0));


            Table.prototype.init = function () {
                throw new Error('table is already init');
            }
        };

        Table.prototype.addRow = function () {
            this.rows.push(new Row(this.rows.length, this));
        };

        Table.prototype.moveTo = function (direction) {
            switch (direction) {
                case 'right' :
                    this.setSelection(this.selected.next());
                    break;
                case 'left' :
                    this.setSelection(this.selected.prev());
                    break;
                case 'up' :
                    this.setSelection(this.selected.up());
                    break;
                case 'down' :
                    this.setSelection(this.selected.down());
                    break;
            }
        };

        Table.prototype.setSelection = function (elem) {

            try {

                if (this.selected) {
                    var result = this.selected.onLeave();
                    if(result === false) return;
                    this.html.find('th, td').removeClass('select');

                }
                if (elem) {
                    elem.onSelect();
                    var coords = elem.coords();

                    this.html.find('th:nth-child(' + (coords.left() + 2) + '), tr:nth-child(' + (coords.top() + 2) + ') td:first-child').addClass('select');
                    elem.focus();
                }

                this.selected = elem;

            } catch (e) {
                if (e == 'invalid') {
                    this.selected.focus();

                    return false;
                } else {
                    throw e;
                }
            }
        };

        Table.prototype.addAction = function (listener) {
            if (typeof listener == 'function') {
                this.inputActions.push(listener);
            }
        };

        Table.prototype.addKeyListener = function (listener) {
            if (typeof listener == 'function') {
                this.keyControllers.push(listener);
            }
        };

        Table.prototype.addMouseListener = function (listener) {
            if (typeof listener == 'function') {
                this.mouseControllers.push(listener);
            }
        };

        Table.prototype.notifyAll = function (event, elem) {
            var controllers;
            switch (event.type) {
                case 'click':
                    controllers = this.mouseControllers;
                    break;
                case 'keydown':
                    controllers = this.keyControllers;
                    break;
            }

            for (var i = 0; i < controllers.length; i++) {
                controllers[i](event, elem);
            }
        };

        Table.prototype.get = function (row, col) {
            return this.rows[row].getElem(col);
        };

        Table.prototype.action = function (event, elem) {
            //for (var i = 0; i < this.inputActions.length && !this.inputActions[i](elem); i++);
            try {
                elem = elem || this.selected;
                if (elem) elem.action(event);
            } catch (e) {
                if (e == 'invalid') {
                    return false;
                } else {
                    throw e;
                }

            }

        };

        Table.prototype.moveToStart = function () {
            this.setSelection(this.selected.row.getElem(0));
        }

    }

    function Row(idx, table) {

        this.elements = [];
        this.html = $('<tr><td>' + (idx + 1) + '</td></tr>');
        this.idx = idx;
        //this.cells = cells;
        //this.rows = rows;
        this.table = table;


        for (var i = 0; i < table.cells.length; i++) {
            var elem = new Elem(table.cells[i], i, this);

            this.elements.push(elem);
        }

        table.html.append(this.html);

        Row.prototype.next = function () {
            return this.idx == table.rows.length - 1 ? this : table.rows[this.idx + 1];
        };

        Row.prototype.prev = function () {
            return this.idx == 0 ? this : table.rows[this.idx - 1];
        };

        Row.prototype.index = function () {
            return this.idx;
        };

        Row.prototype.getElem = function (index) {

            return this.elements[index];
        };

        Row.prototype.size = function () {
            return this.elements.length;
        };

        Row.prototype.foreach = function (func) {
            if (typeof func == 'function') {
                for (var i = 0; i < this.elements.length - 1; i++) {
                    func(this.elements[i]);
                }
            }
        };

        Row.prototype.getAllData = function () {
            var result = {
                'index' : this.idx
            };
            this.foreach(function (e) {
                result[e.cell.type] = e.getValue();
            });
            return result;
        };

        Row.prototype.remove = function () {

        };

        Row.prototype.toString = function () {
            var res = "";
            for (var i = 0; i < this.elements.length; i++) {
                res += this.elements[i] + " ";
            }
            return res;
        };

        Row.prototype.delete = function (){
            //this.table.moveTo('down');
            if(this.table.rows.length > 1){
                if(this.idx < this.table.rows.length - 1){
                    this.table.moveTo('down');
                } else {
                    this.table.moveTo('up');
                }
                this.table.rows.splice(this.idx ,1);

                this.html.remove();
                for(var i = 0; i < this.table.rows.length; i++){
                    this.table.rows[i].setIdx(i);
                }

                this.table.onDelete(this.idx);
            }
        };

        Row.prototype.setIdx = function (idx){
            this.idx = idx;
            this.html.find('td:first-child').html(idx + 1);
        }

        Row.prototype.update = function (data){
            console.log(this.elements);
            for(var i = 0; i < this.elements.length; i++){
                var e = this.elements[i];
                e.setValue(data[e.cell.type]);
            }
        }


    }

    function Elem(cell, idx, row) {

        this.html = $("<td></td>");
        this.data = null;
        this.inp = null;
        this.isEdit = false;
        this.elements = row.elements;
        this.cell = cell;
        this.idx = idx;
        this.row = row;
        var self = this;


        this.row.html.append(this.html);


        if (this.cell.input) {
            switch (this.cell.input.tag) {
                case 'input':
                    var type = this.cell.input.type;
                    if (type == 'text' || type == 'number') {
                        this.inp = $('<input type="' + type + '">');

                        this.getValue0 = function () {
                            if (this.isEdit) {
                                return this.inp.val();
                            } else {
                                return this.data;
                            }
                        };

                        this.edit0 = function () {
                            this.isEdit = true;
                            this.inp.val(this.html.html());
                            this.html.html('');
                            this.html.append(this.inp);
                            this.focus();
                        };

                        this.focus0 = function () {
                            this.inp.focus().select();
                        };

                        this.save0 = function () {

                            this.html.removeClass('error');
                            this.isEdit = false;
                            this.data = this.inp.val();
                            this.inp.detach();
                            this.html.html(this.data);
                        };

                        this.setValue0 = function (value){
                            this.data = value;
                            this.html.html(value);
                        };

                        //checkbox
                    } else if (type == 'checkbox') {

                        //Запиливаем свой чекбокс, что бы не бороться с поведением стандартного

                        this.checkbox = new Checkbox(this.cell.input.attrs.checked);
                        this.inp = this.checkbox.html();
                        this.html.append(this.inp);

                        this.getValue0 = function () {
                            return this.checkbox.status;
                        };

                        this.action0 = function (event) {
                            this.isEdit = true;

                            this.edit();
                            this.save();
                            this.isEdit = false;

                        };

                        this.edit0 = function () {
                            this.checkbox.action();

                        };

                        this.save0 = function () {

                        };

                        this.setValue0 = function (value){
                            this.data = value;
                            //this.html.html(value);
                            if(value === true){
                                this.checkbox.switch('right');
                            } else if(value === false){
                                this.checkbox.switch('left');
                            }
                        };


                        //only remove
                    } else if (type == 'button') {
                        this.inp = $('<input type="button">');

                        this.getValue0 = function () {

                        };

                        this.edit0 = function () {
                            this.validate();
                        };

                        //this.validate0 = function () {
                        //    return true;
                        //};
                        this.html.append(this.inp);
                    } else {
                        throw new Error('unknown type ' + type + ' for input');
                    }
                    break;

                case 'select':
                    //select

                    this.inp = $('<select></select>');
                    //this.data = 1;

                    this.inp.change(function(e){
                        self.isEdit = true;
                        self.save();
                        self.isEdit = false;
                    });


                    for(var i = 0; i < this.cell.input.options.length; i++){
                        this.inp.append('<option>' + this.cell.input.options[i] + '</option>');
                    }
                    this.inp.hide();
                    this.html.append('<p>' + this.cell.input.options[0] + '</p>');
                    this.html.append(this.inp);


                    this.focus0 = function (){
                        //this.isEdit = true;
                        var val = this.html.find('p').html('');
                        this.inp.find('option[value="' + val + '"]').attr('selected', 'selected');
                        //this.html.append(this.inp);
                        this.inp.show();
                        this.inp.focus();
                    };

                    this.onLeave0= function (event){
                        //if(this.inp.is(':focus')) return false;
                        var val = this.inp.find('option:selected').val();
                        this.html.find('p').html(val);

                        this.inp.hide();
                        //this.inp.blur();
                        //this.inp.attr('disabled', 'disabled');
                    };

                    this.getValue0 = function (){
                        return this.inp.find('option:selected').val();
                    };

                    this.action0 = function (){
                        this.inp.focus();
                        //if(this.inp.is(':focus')){
                        //    this.inp.blur();
                        //} else {
                        //    this.inp.focus();
                        //}
                    };

                    this.setValue0 = function (value){

                    };


                    break;
            }

            for (var prop in this.cell.input.attrs) {
                this.inp.attr(prop, this.cell.input.attrs[prop]);
            }
        } else {
            if (this.cell.edit) {
                throw new Error('cell must be non-editable or contains property "input"');
            } else {

                this.action0 = function (event) {

                    this.row.table.moveTo('right');
                    //if(event.type == 'click'){
                    //    this.row.table.action(event);
                    //}
                };
            }

        }

        if (this.cell.default != undefined) {
            if (this.cell.visible) {
                this.html.find('input').val(this.data = this.cell.default);
            } else {
                this.html.append(this.data = this.cell.default);
            }
        }

        Elem.prototype.onLeave = function (event) {
            if(this.onLeave0 != undefined){
                var leave = this.onLeave0(event);
            } else {
                leave = true;
            }
            if(leave || leave == undefined){
                if (this.isEdit) {
                    this.save();
                }
                this.html.removeClass('active').removeClass('disable');
            }
            return leave;

        };

        Elem.prototype.focus = function () {
            return this.focus0 == undefined ? undefined : this.focus0();
        }

        Elem.prototype.getValue = function () {
            return this.getValue0 == undefined ? this.data : this.getValue0();
        };

        Elem.prototype.edit = function () {
            return this.edit0 == undefined ? undefined : this.edit0();
        };
        //
        //Elem.prototype.save = function () {
        //
        //    if (this.save0 != undefined) {
        //        console.log(this.isEdit);
        //        if (this.isEdit) {
        //            console.log('save');
        //            if (this.validate()) {
        //                return this.save0();
        //            } else {
        //                this.html.addClass('error');
        //                throw 'invalid';
        //            }
        //        }
        //    } else {
        //        return undefined;
        //    }
        //    //return this.save0 == undefined ? undefined : this.save0();
        //};


        Elem.prototype.save = function () {

            if (this.isEdit) {

                if (this.validate()) {
                    this.html.removeClass('error');

                    return this.save0 == undefined ? true : this.save0();
                } else {
                    this.html.addClass('error');
                    throw 'invalid';
                }
            }

            //return this.save0 == undefined ? undefined : this.save0();
        };

        Elem.prototype.validate = function () {

            //if (this.validate0 != undefined) {
            //    return this.validate0();
            //} else {
            var data = this.row.getAllData();
                var valid;
                if (this.cell.validate) {

                    valid = this.cell.validate(data);
                } else {
                    valid = true;
                }

                valid = valid == undefined ? true : valid;

                if(valid && this.cell.type != 'delete'){
                    this.row.update(data);
                    table.onChange(data);
                    console.log(data);
                }
                return valid;
            //}

        };

        Elem.prototype.onSelect = function (event) {

            this.html.addClass('active');
            if (!this.cell.edit) {
                this.html.addClass('disable');
            }
        };

        Elem.prototype.coords = function () {
            return new Coords(this.idx, this.row.idx);
        };

        Elem.prototype.action = function (event) {

            if (this.action0 == undefined) {

                if (!this.isEdit) {
                    this.edit();
                } else {
                    //this.save();

                    this.row.table.moveTo('right');
                }
            } else {
                this.action0(event);
            }
        };

        Elem.prototype.getCell = function () {
            return this.cell;
        };

        Elem.prototype.required = function () {
            return this.cell.required != undefined ? this.cell.required : false;
        };

        Elem.prototype.getObject = function () {
            return this.html;
        };

        Elem.prototype.next = function () {
            return this.idx == this.elements.length - 1 ? this : this.elements[this.idx + 1];
        };

        Elem.prototype.prev = function () {
            return this.idx == 0 ? this : this.elements[this.idx - 1];
        };

        Elem.prototype.up = function () {
            return this.row.prev().getElem(this.idx);
        };

        Elem.prototype.down = function () {
            return this.row.next().getElem(this.idx);
        };

        Elem.prototype.toString = function () {
            return this.cell.text + " " + this.data;
        }

        Elem.prototype.setValue = function (value){
            console.log(this.cell.type + " " + value);
            if(this.setValue0) {
                this.setValue0(value);
            } else {
                this.data = value;
                this.html.html(value);
            }
        }
    }

    function Coords(col, row) {

        this.left = function () {
            return col;
        }

        this.top = function () {
            return row;
        }

        Coords.prototype.toString = function () {
            return "col : " + col + ", row : " + row;
        }
    }

    function createTh(cell) {
        var th = $('<th></th>').append(cell.text);
        //th.attr('data-type', cell.type);
        return th;
    }


    function Checkbox(status) {
        this.status = !!status;
        this.checkbox = get(status);


        this.action = function () {
            if (this.status) {
                this.switch('left');
            } else {
                this.switch('right');
            }
            this.status = !this.status;
        };

        this.switch = function (side) {
            if (side == 'left') {
                this.checkbox.find('.chb-in div').html('off').animate({'left': 0}, function () {
                    $(this).parent().css({'background-color': 'white'});
                });
            } else if (side == 'right') {
                this.checkbox.find('.chb-in div').html('on').animate({'left': 18}, function () {

                    $(this).parent().css({'background-color': 'green'});
                });
            }
        };

        this.checked = function () {
            return this.status;
        };

        this.html = function () {
            return this.checkbox;
        };

        function get() {
            var checkbox = $('<div class="checkbox-custom"></div>');
            checkbox.css({
                'height': '100%',
                'position': 'relative',
                'cursor': 'pointer'
            });

            var cont = $('<div class="chb-in"></div>').css({
                'position': 'absolute',
                'margin': 'auto',
                'top': 0,
                'bottom': 0,
                'width': '40px',
                'height': '15px',
                'left': 0,
                'right': 0,
                'border-radius': '10px',
                'box-shadow': '0 0 3px 0px inset'

            });
            //var left = status ? 18 : 0;

            var but = $('<div></div>').css({
                'position': 'absolute',
                'left': '0px',
                'height': '13px',
                'width': '20px',
                'background-color': 'white',
                'border-radius': '10px',
                'border': '1px solid #B9B9B9',
                'font-size': '10px',
                'text-align': 'center'
            });

            checkbox.append(cont.append(but));
            return checkbox;
        }

        if (status) {
            this.switch('right');
        }

        //this.checkbox.click(function(){
        //    this.action();
        //});


    }

}
