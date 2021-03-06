import {forwardRef, useRef, useState} from 'react';
import {
    DialogTitle, TextField, Dialog, DialogActions, DialogContent,
    DialogContentText, Button, Slide
} from "@material-ui/core"
import {useDispatch, useSelector} from "react-redux";
import {askNewQuestion} from "../../redux/feautures/questions";
import {useHistory} from "react-router-dom";
import {Alert, IconButton} from "@mui/material";
import {Close as CloseIcon, Check as CheckIcon, PriorityHigh as AlertIcon} from "@mui/icons-material";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
}); //Этот компонент нужен для того, чтобы диалоговое окно открывало в виде "слайда"


const AskQuestion = () => {
    const {isSignedIn} = useSelector(store => store.auth);
    const {askSuccess, error, asking} = useSelector(store => store.questions);

    const { text } = useSelector((store) => store.languages);

    const [openForm, setOpenForm] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);

    const dispatch = useDispatch();
    const history = useHistory();

    const inputTitle = useRef("");
    const inputText = useRef("");

    const handleClickOpen = () => { //Если есть токен, то открывается диалог с формой, в ином же случае выскакивает диалог
         (isSignedIn) ? setOpenForm(true) : setOpenAlert(true); //с ошибкой
    };

    const handleClose = () => { //Если открыт диалог с формой, то это окошко закрывается. В ином же случае закрывается
        if (openForm) { //диалог с ошибкой
            setOpenForm(false)
        } else {
            setOpenAlert(false);
        }
        return dispatch({type: "questions/data/clear"});
    };

    const handleSubmit = () => {
        dispatch(askNewQuestion(String(inputTitle.current), String(inputText.current)));
    }

    return (
        <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                {text.askQuestion}
            </Button>
            <Dialog open={openForm} onClose={handleClose} >
                <DialogTitle id="form-dialog-title">{text.question}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {text.questionInstruction}
                    </DialogContentText>
                        {(askSuccess || error) &&
                            <Alert
                                icon={askSuccess ? <CheckIcon fontSize="inherit" /> : <AlertIcon fontSize="inherit" />}
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => dispatch({type: "questions/data/clear"})}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>}
                                   severity={askSuccess ? "success" : "error"}>
                                {askSuccess || error}
                            </Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        label={text.questionTitle}
                        type="text"
                        fullWidth
                        ref={inputTitle}
                        onChange={(e) => inputTitle.current = e.target.value}
                    />
                    <TextField
                        margin="dense"
                        id="text"
                        label={text.questionText}
                        type="text"
                        fullWidth
                        ref={inputText}
                        onChange={e => inputText.current = (e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {text.closeButton}
                    </Button>
                    <Button disabled={asking ? true : !!askSuccess} onClick={handleSubmit} color="primary">
                        {text.askButton}
                    </Button>
                </DialogActions>
            </Dialog>

            {/*Если пользователь не авторизован, то ему открывается следующее окошко: ...*/}
            <Dialog
                open={openAlert}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">{text.questionError}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {text.questionErrorSignIn || error}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {text.closeButton}
                    </Button>
                    <Button onClick={() => history.push("/sign-up")} color="primary">
                        {text.questionSignIn}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AskQuestion;