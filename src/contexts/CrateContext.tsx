import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { SupaCrate, SupaReleaseGroup, SupaNote } from "../../utils/types";

type CrateAction =
    | { type: "SET_TITLE"; payload: string }
    | { type: "SET_TO_NAME"; payload: string }
    | { type: "SET_FROM_NAME"; payload: string }
    | { type: "SET_DESCRIPTION"; payload: string }
    | { type: "ADD_RELEASE_GROUP"; payload: SupaReleaseGroup }
    | { type: "REMOVE_RELEASE_GROUP"; payload: number }         // index of the release to remove 
    | { type: "ADD_NOTE"; payload: SupaNote }
    | { type: "REMOVE_NOTE"; payload: number }                  // index of the note to remove 
    | { type: "RESET" };

function crateReducer(state: SupaCrate, action: CrateAction): SupaCrate {
    switch (action.type) {
        case "SET_TITLE":
            return { ...state, title: action.payload };
        case "SET_TO_NAME":
            return { ...state, toName: action.payload };
        case "SET_FROM_NAME":
            return { ...state, fromName: action.payload };
        case "SET_DESCRIPTION":
            return { ...state, description: action.payload };
        case "ADD_RELEASE_GROUP":
            return {
                ...state, 
                releaseGroups: [...state.releaseGroups, action.payload], 
                currentIndex: state.currentIndex + 1 
            };
        case "REMOVE_RELEASE_GROUP":
            return {
                ...state,
                releaseGroups: state.releaseGroups.splice(action.payload, 1),
                currentIndex: state.currentIndex - 1
            };
        case "ADD_NOTE":
            return { ...state, notes: [...state.notes, action.payload] }
        case "REMOVE_NOTE":
            return {
                ...state, 
                notes: state.notes.splice(action.payload, 1)
            }
        case "RESET":
            return {
                key: "",
                title: "",
                toName: "",
                fromName: "",
                description: "",
                releaseGroups: [],
                notes: [],
                currentIndex: 0
            };
        default:
            return state;
    }
}

type CrateContextType = {
    state: SupaCrate;
    dispatch: React.Dispatch<CrateAction>;
};

const CrateContext = createContext<CrateContextType | undefined>(undefined);

export function CrateProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(crateReducer, {
        key: "",
        title: "",
        toName: "",
        fromName: "",
        description: "",
        releaseGroups: [],
        notes: [],
        currentIndex: 0
    });

    return (
        <CrateContext.Provider value={{ state, dispatch }}>
            {children}
        </CrateContext.Provider>
    );
}

export function useCrate() {
    const ctx = useContext(CrateContext);
    if (!ctx) throw new Error("useCrate must be used within a CrateProvider");
    return ctx;
}
