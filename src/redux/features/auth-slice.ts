import {createSlice,PayloadAction} from "@reduxjs/toolkit"

interface AuthSlice{
    isAuth: boolean;
    user: null | any;
}

const initialState:AuthSlice = {
    isAuth: false,
    user: null
}

export const auth = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state,action:PayloadAction<object>) =>  {
            state.isAuth = true;
            state.user = action.payload;
        },
        logout: (state) => {
            console.log("logout");
            state.isAuth = false;
            state.user = null;
        }
    }
})
export const {login,logout} = auth.actions
export default auth.reducer;