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
        // Schemas
        const trivialSchema = new Schema({
          nodes: {
            doc: {content: "paragraph"},
            paragraph: {content: "text*"},
            text: {inline: true},
            /* ... and so on */
          }
        })

        const groupSchema = new Schema({
          nodes: {
            doc: {content: "block+"},
            paragraph: {group: "block", content: "text*"},
            blockquote: {group: "block", content: "block+"},
            text: {}
          }
        })

        const markSchema = new Schema({
          nodes: {
            doc: {content: "block+"},
            paragraph: {group: "block", content: "text*", marks: "_"},
            heading: {group: "block", content: "text*", marks: ""},
            text: {inline: true}
          },
          marks: {
            strong: {},
            em: {}
          }
        })
        // Document structure
        let doc = schema.node("doc", null, [
          schema.node("paragraph", null, [schema.text("Hello, test doc and testing and testing and testing!")]),
        ]);


        // State
        let state = EditorState.create({
          markSchema,
          doc: doc,
          plugins: [
            history(),
            keymap({"Mod-z": undo, "Mod-y": redo}),
            keymap(baseKeymap)
          ]
        })

        // View
        let view = new EditorView(document.body, {
          state,
          dispatchTransaction(transaction) {
            console.log("Document size went from", transaction.before.content.size,
                        "to", transaction.doc.content.size)
            transaction.split(2)
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

        <h1 id="content">Real Time Text Editor</h1>
        <p>Made with ❤️ by Yash Dani, June 2020.</p>     
        <br />
        <p>Text Editor</p>          
        <div id="editor" />
        <div id="content" />

    </div>
  );
}

export default App;
