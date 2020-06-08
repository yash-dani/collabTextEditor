import React, {useEffect} from 'react';
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {DOMParser, Schema} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
//import {addListNodes} from "prosemirror-schema-list"
//import {exampleSetup} from "prosemirror-example-setup"
import './App.css';
export collab from "prosemirror-collab"
import {baseKeymap} from 'prosemirror-commands'
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"



function App() {
    useEffect(() => {
        class Authority {
          constructor(doc) {
            this.doc = doc
            this.steps = []
            this.stepClientIDs = []
            this.onNewSteps = []
          }

          receiveSteps(version, steps, clientID) {
            if (version != this.steps.length) return

            // Apply and accumulate new steps
            steps.forEach(step => {
              this.doc = step.apply(this.doc).doc
              this.steps.push(step)
              this.stepClientIDs.push(clientID)
            })
            // Signal listeners
            this.onNewSteps.forEach(function(f) { f() })
          }

          stepsSince(version) {
            return {
              steps: this.steps.slice(version),
              clientIDs: this.stepClientIDs.slice(version)
            }
          }
        }


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
          schema.node("paragraph", null, [schema.text("Hello, this is some sample text. Click here to start editing!")]),
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
        function collabEditor(authority, place) {
          let view = new EditorView(place, {
            state: EditorState.create({
              doc: authority.doc,
              plugins: [collab({version: authority.steps.length})]
            }),
            dispatchTransaction(transaction) {
              let newState = view.state.apply(transaction)
              view.updateState(newState)
              let sendable = collab.sendableSteps(newState)
              if (sendable)
                authority.receiveSteps(sendable.version, sendable.steps,
                                       sendable.clientID)
            }
          })

          authority.onNewSteps.push(function() {
            let newData = authority.stepsSince(collab.getVersion(view.state))
            view.dispatch(
              collab.receiveTransaction(view.state, newData.steps, newData.clientIDs))
          })

          return view
        }
        // View
        var a = new Authority(doc)
        let view = collabEditor(a, document.body)
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
        <h2>The Text Editor</h2>          
        <div id="editor" />
        <div id="content" />

    </div>
  );
}

export default App;
