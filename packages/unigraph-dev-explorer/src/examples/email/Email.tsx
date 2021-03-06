import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from "@material-ui/core";
import React from "react";
import { registerDynamicViews, withUnigraphSubscription } from "unigraph-dev-common/lib/api/unigraph-react"
import { pkg as emailPackage } from 'unigraph-dev-common/lib/data/unigraph.email.pkg';
import { unpad, byUpdatedAt } from "unigraph-dev-common/lib/utils/entityUtils";
import { AutoDynamicView } from "../../components/ObjectView/DefaultObjectView";
import { DynamicViewRenderer } from "../../global";
import Sugar from 'sugar';
import { Link } from "@material-ui/icons";
import { getComponentFromPage } from "../../Workspace";

type AEmail = {
    name: string,
    message_id: string,
    message: {
        date_received: string,
        sender: string[],
        recipient: string[]
    },
    content: {
        text: string,
        abstract: string
    }
}

const EmailListBody: React.FC<{data: any[]}> = ({data}) => {

    return <div>
        <List>
            {data.sort(byUpdatedAt).reverse().map(it => <ListItem button key={it.uid}>
                <AutoDynamicView object={it} />
            </ListItem>)}
        </List>
    </div>
}

const EmailMessage: DynamicViewRenderer = ({data, callbacks}) => {
    let unpadded: AEmail = unpad(data);
    console.log(data);
    return <ListItem>
        <ListItemAvatar><Avatar>{unpadded.message?.sender?.[0]?.[0]}</Avatar></ListItemAvatar>
        <ListItemText
            primary={data?.get('name')?.['_value']?.['_value']?.['_value.%']}
            secondary={<div style={{display: "flex", alignItems: "center"}}>
                <Link onClick={() => {
                    const htmlUid = data?.get('content/text')?.['_value']?.['_value']?.['uid'];
                    if (htmlUid) window.newTab(window.layoutModel, getComponentFromPage('/library/object', {uid: htmlUid, context: data.uid}));
                    if (callbacks?.removeFromContext) callbacks.removeFromContext();
                }}/>
                {unpadded.content?.abstract + "..."}
            </div>}
        />
        <ListItemText style={{flex: "none"}} secondary={Sugar.Date.relative(new Date(unpadded?.message?.date_received))}/>
    </ListItem>
}

registerDynamicViews({'$/schema/email_message': EmailMessage})

export const EmailList = withUnigraphSubscription(
    EmailListBody,
    { schemas: [], defaultData: Array(10).fill({'type': {'unigraph.id': '$/skeleton/default'}}), packages: [emailPackage]},
    { afterSchemasLoaded: (subsId: number, data: any, setData: any) => {
        window.unigraph.subscribeToType("$/schema/email_message", (result: any[]) => {setData(result.reverse())}, subsId);
    }}
)