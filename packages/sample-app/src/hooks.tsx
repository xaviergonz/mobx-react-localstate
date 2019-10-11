import { when } from "mobx"
import {
    mobxObserver,
    useMobxActions,
    useMobxAsObservableSource,
    useMobxEffects,
    useMobxStore
} from "mobx-react-component"
import * as React from "react"
import { memo, useContext } from "react"
import { SomeContext } from "./SomeContext"

interface IMyComponentProps {
    x: number
}

export const MyComponent = memo(
    mobxObserver((props: IMyComponentProps) => {
        // props is a shallowly observable object

        // note 1: its ref will be kept immutable, so when using hooks pass the actual
        // single props it depends on, not just "props"
        // if you really need to access the original props object for some reason
        // you can still use `getOriginalProps(props)`

        // note 2: do NOT ever destructure this when using or else the observability
        // will be lost! (in other words, always use props.X to access the value)

        // observable refs of the given data

        // note 1: do NOT ever destructure this when using or else the observability
        // will be lost! (in other words, always use obsContext().X to access the value)
        // note 2: if the context value is actually an observable that will never
        // change its ref then this is not needed
        const obsContext = useMobxAsObservableSource(useContext(SomeContext), "ref")

        const state = useMobxStore(() =>
            // alternatively observable(...) can be returned instead if you need to use decorators
            ({
                // observable value
                y: 0,

                // computed
                get sum() {
                    return props.x + this.y + obsContext().z
                }
            })
        )

        const actions = useMobxActions(() => ({
            incY() {
                state.y++
            }
        }))

        // effects will be started on first render and auto disposed on unmount
        // NOTE: it is usually preferable just to use useEffect / useLayoutEffect
        // with the observable property as a dependency instead as shown next
        // since that allows to mix and match observable and unobservable
        // values
        useMobxEffects(() => [
            when(
                () => state.sum === 10,
                () => {
                    alert("you reached ten! (hooks / useMobxEffects)")
                }
            )
        ])

        // or
        React.useEffect(() => {
            if (state.sum === 10) {
                alert("you reached ten! (hooks / useEffect)")
            }
        }, [state.sum])

        return (
            <div>
                <div>
                    x + y + z = {props.x} + {state.y} + {obsContext().z} = {state.sum}
                </div>
                <button onClick={actions.incY}>Increment Y (state)</button>
            </div>
        )
    })
)

MyComponent.displayName = "MyComponent"

// usage
// <MyComponent x={5}/>
