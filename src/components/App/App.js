import React, {useEffect} from 'react';
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {DOMParser, Schema} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
//import {addListNodes} from "prosemirror-schema-list"
//import {exampleSetup} from "prosemirror-example-setup"
//import './App.css';
import {baseKeymap} from 'prosemirror-commands'
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"

function App() {
    useEffect(() => {

        let doc = schema.node("doc", null, [
          schema.node("paragraph", null, [schema.text("One.")]),
          schema.node("horizontal_rule"),
          schema.node("paragraph", null, [schema.text("Two!")]),
          schema.node("horizontal_rule")
        ])
        let state = EditorState.create({
          doc: doc,
          plugins: [
            history(),
            keymap({"Mod-z": undo, "Mod-y": redo}),
            keymap(baseKeymap)
          ]
        })
        let view = new EditorView(document.body, {
          state,
          dispatchTransaction(transaction) {
            console.log("Document size went from", transaction.before.content.size,
                        "to", transaction.doc.content.size)
            let newState = view.state.apply(transaction)
            view.updateState(newState)
          }
        })
        /*const mySchema = new Schema({
            nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
            marks: schema.spec.marks
        })

        window.view = new EditorView(document.querySelector("#editor"), {
            state: EditorState.create({
                doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
                plugins: exampleSetup({schema: mySchema})
            })
        })*/
    });

  return (
    <div className="App">

        <p id="content">type here</p>
        <div id="editor" />
        <div id="content" />

    </div>
  );
}

export default App;
