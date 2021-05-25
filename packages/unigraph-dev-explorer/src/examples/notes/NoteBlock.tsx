import { Typography } from "@material-ui/core";
import React from "react";
import { registerDetailedDynamicViews, registerDynamicViews } from "unigraph-dev-common/lib/api/unigraph-react";
import { unpad } from "unigraph-dev-common/lib/utils/entityUtils";
import { AutoDynamicView } from "../../components/ObjectView/DefaultObjectView";
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials'; 
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave'; 
import { useEffectOnce } from "react-use";

export const getSubentities = (data: any) => {
    let subentities: any, otherChildren: any;
    if (!(data?.['_value']?.['semantic_properties']?.['_value']?.['_value']?.['children']?.['_value['])) {
        [subentities, otherChildren] = [[], []];
    } else {
        [subentities, otherChildren] = data?.['_value']?.['semantic_properties']?.['_value']?.['_value']?.['children']?.['_value['].reduce((prev: any, el: any) => {
            if ('$/schema/subentity' !== el?.['_value']?.type?.['unigraph.id']) return [prev[0], [...prev[1], el['_value']]];
            else return [[...prev[0], el['_value']['_value']], prev[1]]
        }, [[], []])
    }
    return [subentities, otherChildren];
}

export const NoteBody = ({text, children}: any) => {
    return <div>
        <Typography variant="body1">{text}</Typography>
        {children.map((el: any) => <AutoDynamicView object={el} />)}
    </div>
}

export const NoteBodyDetailed = ({data}: any) => {
    const [subentities, otherChildren] = getSubentities(data);
    const unpadded = unpad(data);
    const bodyId = `ckeditor-${data.uid}`;

    useEffectOnce(() => {
        BalloonEditor.create(document.querySelector(`#${bodyId}`), {
            plugins: [
                Essentials, Paragraph, Bold, Italic, Autosave,
            ],
            toolbar: [ 'bold', 'italic'],

            autosave: {
                save(editor: any) {
                    console.log(editor.getData());
                }
            },
        })
            .then((editor: any) => {
            })
    })

    return <div>
        <Typography variant="body1" id={bodyId}>{unpadded.text}</Typography>
        {otherChildren.map((el: any) => <AutoDynamicView object={el} />)}
        {subentities.map((el: any) => <AutoDynamicView object={el} component={NoteBodyDetailed}/>)}
    </div>
}

export const NoteBlock = ({data} : any) => {
    const [subentities, otherChildren] = getSubentities(data);
    const unpadded = unpad(data);

    return <div onClick={() => {window.wsnavigator(`/library/object?uid=${data.uid}`)}}>
        <NoteBody text={unpadded.text} children={otherChildren} />
        <Typography variant="body2" color="textSecondary">{subentities.length ? " and " + subentities.length + " children" : " no children"}</Typography>
    </div>
}

export const DetailedNoteBlock = ({data}: any) => {
    const [subentities, otherChildren] = getSubentities(data);

    return <div>
        <Typography variant="h4">{data['_value']['text']["_value.%"]}</Typography>
        {otherChildren.map((el: any) => <AutoDynamicView object={el} />)}
        {subentities.map((el: any) => <AutoDynamicView object={el} component={NoteBodyDetailed}/>)}
    </div>
}

export const init = () => {
    registerDynamicViews({"$/schema/note_block": NoteBlock})
    registerDetailedDynamicViews({"$/schema/note_block": DetailedNoteBlock})
}