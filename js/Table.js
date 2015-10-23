//Инициализация
function createTable(selector) {

    var containerSelector = selector;

    var cellsArray = [];

    var table;


    return new function () {
        this.addCell = function (cell) {
            cellsArray.push(cell);
            return this;
        };

        this.build = function () {
            table = new Table(selector, cellsArray);
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
            console.log(elem);
            //if (!elem.isEdit) {
                try {
                    var success = table.setSelection(elem);
                    if (success || success == undefined) {
                        elem.action(event);
                    }
                }catch (e){} //invalid value
            //}
        });

        ////Перемещение
        table.addKeyListener(function (event, elem) {
            if (elem.isEdit) return;
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
        });

        //переход по ctrl + enter
        table.addKeyListener(function (event, elem) {
            if (event.ctrlKey && event.keyCode === 13) {
                console.log(elem.coords().top() + " " + table.rows.length);
                var success = table.setSelection(elem);
                if(success || success == undefined){
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

                elem.action(event);

            }
        });
    }

    function Table(selector, cells) {

        this.keyControllers = [];
        this.mouseControllers = [];
        this.inputActions = [];
        var self = this;

        console.log(this.mouseControllers);

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
                edit: false,
                required: false,
                text: "Удалить",
                input: {
                    tag: 'input',
                    type: 'button'
                },
                action: 'delete',
                visible: true,
                default: 'Del'
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
            //console.log(rows[0]);

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
            //console.log(elem);
            try {

                if (this.selected) {
                    this.selected.onLeave();
                    this.html.find('th, td').removeClass('select');

                }
                if (elem) {
                    elem.onSelect();
                    var coords = elem.coords();
                    console.log(coords.toString());
                    this.html.find('th:nth-child(' + (coords.left() + 2) + '), tr:nth-child(' + (coords.top() + 2) + ') td:first-child').addClass('select');
                }

                this.selected = elem;
            } catch (e) {
                if (e == 'invalid') {
                    this.selected.focus();
                    //console.log('ne');
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

        Table.prototype.action = function (event) {
            //for (var i = 0; i < this.inputActions.length && !this.inputActions[i](elem); i++);
            if(this.selected) this.selected.action(event);
        };

        Table.prototype.moveToStart = function () {
            this.setSelection(this.selected.row.getElem(0));
        }

    }

    function Row(idx, table) {

        this.elements = [];
        this.html = $('<tr><td>' + idx + '</td></tr>');
        this.idx = idx;
        //this.cells = cells;
        //this.rows = rows;
        this.table = table;


        for (var i = 0; i < table.cells.length; i++) {
            var elem = new Elem(table.cells[i], i, this);
            //console.log(elem.toString());
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
            //console.log(this.elements[index]);
            return this.elements[index];
        };

        Row.prototype.size = function () {
            return this.elements.length;
        };

        Row.prototype.foreach = function (func) {
            if (typeof func == 'function') {
                for (var i = 0; i < this.elements.length; i++) {
                    func(this.elements[i]);
                }
            }
        };

        Row.prototype.getAllData = function () {
            var result = {};
            this.foreach(function (e) {
                result[e.cell.type] = e.getValue();
            })
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

                    } else if (type == 'checkbox') {
                        this.inp = $('<input type="checkbox">');

                        this.getValue0 = function () {
                            return $(this.inp).prop('checked');
                        };

                        this.edit0 = function () {
                            $(this.inp).prop('checked', !$(this.inp).prop('checked'));
                        };

                        this.save0 = function (){
                            console.log('save');
                            this.html.removeClass('error');
                        };

                        this.action0 = function (event){
                            this.isEdit = true;
                            console.log('action');
                            if(event.type != 'click'){
                                this.edit();
                            }
                            this.save();
                            this.isEdit = false;
                        };

                        this.html.append(this.inp);

                    } else if (type == 'button') {
                        this.inp = $('<input type="button">');

                        this.getValue0 = function () {

                        };

                        this.edit0 = function () {

                        };

                        this.save0 = function () {

                        };

                        this.validate0 = function () {
                            return true;
                        };
                        this.html.append(this.inp);
                    } else {
                        throw new Error('unknown type ' + type + ' for input');
                    }
                    break;

                case 'select':
                    //select


                    break;
            }

            for (var prop in this.cell.input.attrs) {
                this.inp.attr(prop, this.cell.input.attrs[prop]);
            }
        } else {
            if (this.cell.edit) {
                throw new Error('cell must be non-editable or contains property "input"');
            } else {

                this.action0 = function (event){
                    console.log(event);
                    this.row.table.moveTo('right');
                    if(event.type == 'click'){
                        this.row.table.action(event);
                    }
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
            this.save();
            this.html.removeClass('active').removeClass('disable');
        };

        Elem.prototype.focus = function () {
            return this.focus0 == undefined ? undefined : this.focus0();
        }

        Elem.prototype.getValue = function () {
            return this.getValue0 == undefined ? undefined : this.getValue0();
        };

        Elem.prototype.edit = function () {
            return this.edit0 == undefined ? undefined : this.edit0();
        };

        Elem.prototype.save = function () {
            if (this.save0 != undefined) {
                if (this.isEdit) {
                    if (this.validate()) {
                        return this.save0();
                    } else {
                        this.html.addClass('error');
                        throw 'invalid';
                    }
                }
            } else {
                return undefined;
            }
            //return this.save0 == undefined ? undefined : this.save0();
        };

        Elem.prototype.validate = function () {
            console.log('validate');
            //return this.validate0 == undefined ? true : this.validate0();
            if(this.validate0 != undefined){
                return this.validate0();
            } else {
                var valid;
                if (this.cell.validate) {
                    valid = this.cell.validate(this.row.getAllData());
                } else {
                    valid = true;
                }
                return valid == undefined ? true : valid;
            }

        };

        Elem.prototype.onSelect = function (event) {
            //console.log(res);
            this.html.addClass('active');
            if (!this.cell.edit) {
                this.html.addClass('disable');
            }
        };

        Elem.prototype.coords = function () {
            return new Coords(this.idx, this.row.idx);
        };

        Elem.prototype.action = function (event) {
            console.log(event.type);
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
}
