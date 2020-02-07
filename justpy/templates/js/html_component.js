// {% raw %}


Vue.component('html_component', {

    render: function (h) {
        if (this.jp_props.hasOwnProperty('text')) {
            var comps = [this.jp_props.text];
        } else comps = [];

        for (var i = 0; i < this.jp_props.object_props.length; i++) {
            if (this.jp_props.object_props[i].show) {
                comps.push(h(this.jp_props.object_props[i].vue_type, {
                    props: {
                        jp_props: this.jp_props.object_props[i]
                    }
                }))
            }
        }

        description_object = {
            style: this.jp_props.style,
            attrs: this.jp_props.attrs,
            domProps: {
                // innerHTML: this.jp_props.inner_html
            },
            on: {
                // click: this.eventFunction,
            },
            directives: [],
            slot: this.jp_props.slot,
            ref: 'r' + this.jp_props.id
        };

        if (this.jp_props.classes) {
            description_object['class'] = this.jp_props.classes;
        }

        var event_description = {};
        for (i = 0; i < this.jp_props.events.length; i++) {
            event_description[this.jp_props.events[i]] = this.eventFunction
        }
        description_object['on'] = event_description;


        if (this.jp_props.inner_html) {
            description_object['domProps'] = {innerHTML: this.jp_props.inner_html};
        }

        return h(this.jp_props.html_tag, description_object, comps);

    },
    methods: {

        eventFunction: (function (event) {
            if (!this.$props.jp_props.event_propagation) {
                event.stopPropagation();
            }
            if (event.type == 'submit') {
                var form_reference = this.$el;
                var props = this.$props;
                event.preventDefault();    //stop form from being submitted in the normal way
                event.stopPropagation();
                var form_elements_list = [];
                var form_elements = form_reference.elements;
                var reader = new FileReader();
                var file_readers = [];
                var reader_ready = [];
                var file_content = [];
                var file_element_position = null;

                for (var i = 0; i < form_elements.length; i++) {
                    var attributes = form_elements[i].attributes;
                    var attr_dict = {};
                    attr_dict['html_tag'] = form_elements[i].tagName.toLowerCase();
                    for (var j = 0; j < attributes.length; j++) {
                        var attr = attributes[j];
                        attr_dict[attr.name] = attr.value;
                        if (attr.name == 'type') {
                            var input_type = attr.value;
                        }
                    }
                    attr_dict['value'] = form_elements[i].value;
                    attr_dict['checked'] = form_elements[i].checked;
                    attr_dict['id'] = form_elements[i].id;

                    if ((attr_dict['html_tag'] == 'input') && (input_type == 'file') && (files_chosen[attr_dict['id']])) {
                        file_element_position = i;
                        reader_ready = [];
                        attr_dict['files'] = [];
                        const file_list = files_chosen[attr_dict['id']];
                        const num_files = file_list.length;
                        for (let j = 0; j < num_files; j++) {
                            reader_ready.push(false);
                            file_content.push('pending');
                            file_readers.push(new FileReader());
                            attr_dict['files'].push({
                                file_content: 'pending',
                                name: file_list[j].name,
                                size: file_list[j].size,
                                type: file_list[j].type,
                                lastModified: file_list[j].lastModified
                            });
                        }
                        for (let j = 0; j < num_files; j++) {
                            file_readers[j].onload = function (e) {
                                file_content[j] = e.target.result.substring(e.target.result.indexOf(",") + 1);
                                reader_ready[j] = true;
                            };
                            file_readers[j].readAsDataURL(file_list[j]);
                        }
                    }

                    form_elements_list.push(attr_dict);
                }

                function check_readers() {
                    if (reader_ready.every(function (x) {
                        return x
                    })) {
                        const file_element = form_elements_list[file_element_position];

                        for (let i = 0; i < file_element.files.length; i++) {
                            file_element.files[i].file_content = file_content[i];
                        }
                        eventHandler(props, event, form_elements_list);
                        return;
                    } else {

                    }
                    setTimeout(check_readers, 300);
                }

                if (file_element_position === null) {
                    eventHandler(props, event, form_elements_list);
                } else {
                    check_readers();
                }

            } else {
                eventHandler(this.$props, event, false);
            }
        }),
        animateFunction: (function () {
            var animation = this.$props.jp_props.animation;
            var element = this.$el;
            element.classList.add('animated', animation);
            element.addEventListener('animationend', function () {
                element.classList.remove('animated', animation);
            });

        })
    },
    mounted() {

        if (this.$props.jp_props.animation) this.animateFunction();

        if (this.$props.jp_props.input_type && (this.$props.jp_props.input_type != 'file')) {
            this.$refs['r' + this.$props.jp_props.id].value = this.$props.jp_props.value;
        }

        if (this.$props.jp_props.focus) {
            this.$nextTick(() => this.$refs['r' + this.$props.jp_props.id].focus())
        }


    },
    updated() {

        if (this.$props.jp_props.animation) this.animateFunction();

        if (this.$props.jp_props.input_type && (this.$props.jp_props.input_type != 'file')) {

            this.$refs['r' + this.$props.jp_props.id].value = this.$props.jp_props.value;    //make sure that the input value is the correct one received from server

            if (this.$props.jp_props.input_type == 'radio') {
                if (this.$props.jp_props.checked) {
                    this.$refs['r' + this.$props.jp_props.id].checked = true;  // This un-checks other radio buttons in group also
                } else {
                    this.$refs['r' + this.$props.jp_props.id].checked = false;
                }
            }


            if (this.$props.jp_props.input_type == 'checkbox') {
                this.$refs['r' + this.$props.jp_props.id].checked = this.$props.jp_props.checked;
            }
        }

        if (this.$props.jp_props.focus) {
            this.$nextTick(() => this.$refs['r' + this.$props.jp_props.id].focus())
        }

    },
    props: {
        jp_props: Object,

    }
});

// {% endraw %}