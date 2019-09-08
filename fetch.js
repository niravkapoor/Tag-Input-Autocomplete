function fetchApi(url){
    try{
        return fetch(url).then(response => response.json())
        .catch((err) => {
            // toggleLoader(false);
            errorHanlder({type: ERROR_TYPE.API_ERROR, error: err})
        });
    }catch(err) {
        console.log(err);
    }
}