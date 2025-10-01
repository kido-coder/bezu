function PleaseLogin() {
    return (
        <div id='pls'>
            <p id='plslogin' onClick={() => {
                                window.location.pathname = '/';
                            }}>Нэвтэр л дэээ</p>
        </div>
    )
}

export default PleaseLogin;