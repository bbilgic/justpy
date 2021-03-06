// {% raw %}

var files_chosen = {};

function eventHandler(props, event, form_data, aux) {

    if (props.jp_props.debug) {
        console.log('-------------------------');
        console.log('In eventHandler: ' + event.type + '  ' + props.jp_props.vue_type + '  ' + props.jp_props.class_name);
        console.log(event);
        console.log(props.jp_props);
        console.log('-------------------------');
    }
    if (!websocket_ready && use_websockets) {
        return;
    }

    e = {
        'event_type': event.type,
        'id': props.jp_props.id,
        'class_name': props.jp_props.class_name,
        'html_tag': props.jp_props.html_tag,
        'vue_type': props.jp_props.vue_type,
        'event_target': event.target.id,
        // 'event_current_target': event.currentTarget.id,
        'input_type': props.jp_props.input_type,
        'checked': event.target.checked,
        'data': event.data,
        'value': event.target.value,
        'page_id': page_id,
        'websocket_id': websocket_id
    };
    if (props.jp_props.additional_properties) {
        for (let i = 0; i < props.jp_props.additional_properties.length; i++) {
            e[props.jp_props.additional_properties[i]] = event[props.jp_props.additional_properties[i]];
            console.log(event[props.jp_props.additional_properties[i]]);
            console.log(props.jp_props.additional_properties[i]);
        }
    }
    if ((event instanceof Event) && (event.target.type == 'file')) {

        files_chosen[event.target.id] = event.target.files;
        var files = [];
        for (let i = 0; i < event.target.files.length; i++) {
            const fi = event.target.files[i];
            files.push({name: fi.name, size: fi.size, type: fi.type, lastModified: fi.lastModified});
        }
        e['files'] = files;
    }
    if (form_data) {
        e['form_data'] = form_data;
    } else {
        e['event_current_target'] = event.currentTarget.id;
    }
    if (aux) e['aux'] = aux;
    if (event instanceof KeyboardEvent) {
        // https://developer.mozilla.org/en-US/docs/Web/Events/keydown   keyup, keypress
        e['key_data'] = {
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            metaKey: event.metaKey,
            code: event.code,
            key: event.key,
            location: event.location,
            repeat: event.repeat,
            locale: event.locale
        }
    }

    if (props.jp_props.debounce) {
        clearTimeout(props.timeout);
        props.timeout = setTimeout(function () {
                send_to_server(e, props.jp_props.debug);
            }
            , props.jp_props.debounce);
    } else {
        send_to_server(e, props.jp_props.debug);
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    if (props.jp_props.scroll && (event.type == 'click')) {
        event.preventDefault();
        c = document.getElementById(props.jp_props.scroll_to);

        c.scrollIntoView({
            behavior: props.jp_props.scroll_option,    // Default is 'smooth'
            block: props.jp_props.block_option,
            inline: props.jp_props.inline_option,
        });

    }
}

function send_to_server(e, debug_flag) {
    if (debug_flag) {
        console.log('Sending message to server:');
        console.log({'type': 'event', 'event_data': e});
    }
    if (use_websockets) {
        if (websocket_ready) {
            socket.send(JSON.stringify({'type': 'event', 'event_data': e}));
        } else {
            setTimeout(function () {
                socket.send(JSON.stringify({'type': 'event', 'event_data': e}));
            }, 1000);
        }
    } else {

        d = JSON.stringify({'type': 'event', 'event_data': e});
        $.ajax({
            type: "POST",
            url: "/zzz_justpy_ajax",
            data: JSON.stringify({'type': 'event', 'event_data': e}),
            success: function (msg) {
                if (msg) app1.justpyComponents = msg.data;
            },
            dataType: 'json'
        });
    }
}

// {% endraw %}