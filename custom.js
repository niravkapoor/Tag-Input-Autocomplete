var app = null;

const toggleLoader = (flag) => {
    let loader = document.getElementById('loader');
    let overlay = document.getElementById('overlay');
    loader.style.display = flag ? 'block' : 'none';
    overlay.style.display = flag ? 'block' : 'none';
}

const txtChangeHandler = (data) => {
    try {
        createSuggList(app.filterCountry(data.target.value));
    }catch(err) {
        errorHanlder({error: err});
        console.log('Error in txtChangeHandler', err)
    }
}

const txtKeyUpHandler = (evt) => {
    try{
        try{
            let keycode = evt.which || evt.keyCode;
            switch (true){
                case keycode === APP_CONSTANT.KEY_CODES.BACKSPACE:
                    let _data = app.getTaggedData();
                    if(!evt.currentTarget.value  && app.isLastElemRemove && _data.length > 0){
                        document.getElementById(_data[_data.length - 1].data.alpha3Code).remove();
                        app.addCountry(_data[_data.length - 1].data, _data[_data.length - 1].countryListIndex);
                        updateRecordDisplay(app.removeTaggedData(_data.length - 1))
                    }else{
                        //To handle backspace press , when text is empty first time to not to remove taged data
                        app.isLastElemRemove = !evt.currentTarget.value ? true : false;
                        txtChangeHandler(evt);
                    }
                    break;
                case  (keycode > 64 && keycode < 91) || (keycode > 96 && keycode < 123):
                    app.isLastElemRemove = false;
                    txtChangeHandler(evt);
                    break;
                case evt.type === "paste":
                    createSuggList(app.filterCountry(evt.target.value));
                    break;
            }
        }catch(err) {
            errorHanlder({error: err});
            console.log('Error in txtKeyUpHandler', err);
        }
    }catch(err){
        errorHanlder({error: err});
        console.log('Error in txtKeyUpHandler', err)
    }
}

const clickOutside = (evt) => {
    let list = document.getElementById('list');
    list.classList.add("list-none");
    list.classList.remove("list");
    list.innerHTML = "";
}

const changeClick = (evt) => {
    evt.stopPropagation();
}

const getdocumentLoad = (e) => {
    try{
        let sugsTxt = document.getElementById('sugg-txt');
        sugsTxt.addEventListener('change', txtChangeHandler);
        sugsTxt.addEventListener('keyup', txtKeyUpHandler);
        sugsTxt.addEventListener('paste', txtKeyUpHandler);
        sugsTxt.addEventListener('click', txtChangeHandler);
        let change = document.getElementById('change');
        change.addEventListener('click', changeClick);
        window.addEventListener('click', clickOutside)

    }catch(err) {
        errorHanlder({error: err});
        console.log('Error in getdocumentLoad', err)
    }
}

function init() {
    try{
        let country = [];
        let filteredData = [];
        let taggedData = [];
        this.isLastElemRemove = false;
        this.getCountry = () => country;

        this.getFilterData = () => filteredData;

        this.setCountry = (data) => {
            country = data;
        }

        this.removeSpecificCount = (index, tagIndex) => {
            country[index] = null;
            filteredData.splice(tagIndex, 1);
            return filteredData;
        }

        this.addCountry = (data, index) => {
            country[index] = data;
        }

        this.fetchCountry = () => {
            toggleLoader(true);
            fetchApi(APP_CONSTANT.API_URL).then((data) => {
                toggleLoader(false);
                this.setCountry(data);
            })
        }

        this.filterCountry = (txt) => {
            txt = txt.toLowerCase();
            filteredData = [];
            try{
                txt && this.getCountry().map((ele, index) => {
                    if(ele && ele.name.toLowerCase().indexOf(txt) > -1){
                        filteredData.push({ index, data : ele });
                    }
                });
                return filteredData;
            }
            catch(err) {
                errorHanlder({error: err});
                console.log('Error in filterCountry', err)
            }
        }

        this.removeFilterData = (index) => {
            filteredData.splice(index,1);
        }

        this.setTaggedData = (data) => {
            taggedData.push(data)
            return taggedData;
        }
        
        this.getTaggedData = () => taggedData;

        this.removeTaggedData = (index) => { 
            taggedData.splice(index, 1);
            return  taggedData;
        };
    }catch(err){
        errorHanlder({error: err});
        console.log('Error in init', err)
    }
}

function initFactory() {
    try{    
        getdocumentLoad();
        if(app){
            return app;
        }
        return new init();
    }catch(err) {
        errorHanlder({error: err});
        console.log('Error in initFactory', err);
    }
}

app = initFactory();
app.fetchCountry();

const createSuggList = (data = []) => {
    try{
        let list = document.getElementById('list');
        if(!data.length){
            list.classList.add("list-none");
            list.classList.remove("list");
            list.innerHTML = "";
            return;
        }
        
        let country = [];
        data.forEach((element, index) => {
            let ele = element.data;
            country.push(
                `<span id="data-${element.index}-${index}" class="list__item ${index%2 === 0 ? "list__item--odd" : ""} " onclick="itemSelectionClick(this)" data-json='${JSON.stringify(ele)}'>${ele.name}: ${ele.alpha3Code} </span>`
            )
        })
        list.innerHTML = country.join("");
        list.classList.add("list");
    }catch(err) {
        errorHanlder({error: err});
        console.log('Error in createSuggList', err)
    }
}

const itemSelectionClick = (element) => {
    try{
        let data = JSON.parse(element.getAttribute("data-json"));
        let countryListIndex = element.id.split("-")[1];
        let filterListIndex = element.id.split("-")[2];

        let _tagData = app.setTaggedData({countryListIndex, filterListIndex, data});
        let tag = document.getElementById('tag');
        let div = createTag(data.alpha3Code, countryListIndex, _tagData.length - 1, element.getAttribute("data-json"));
        tag.appendChild(div);

        let updatedTag = app.removeSpecificCount(countryListIndex, filterListIndex);
        createSuggList(updatedTag);
        updateRecordDisplay(_tagData);
    }catch(err) {
        errorHanlder({error: err});
        console.log('Error in itemSelectionClick', err);
    }
}

const createTag = (alpha3Code, countryListIndex, index, data) => {
    let div = document.createElement("DIV");
    div.id = alpha3Code;
    div.classList.add("cntr__tag");
    div.innerHTML = `${alpha3Code} <span data-json='${data}' onclick="deleteTag(this, '${alpha3Code}', ${countryListIndex}, ${index})" class="cntr__tag-close" />`;

    return div
}

const renderAllTaggedData = () => {
    let tagData = app.getTaggedData();
    let tag = document.getElementById('tag');
    tag.innerHTML = '';
    tagData.forEach((ele, index) => {
        let div = createTag(ele.data.alpha3Code, ele.countryListIndex, index, JSON.stringify(ele.data))
        tag.appendChild(div);
    })
    updateRecordDisplay(tagData);
}

const deleteTag = (element, id, countryListIndex, taggedDataIndex) => {
    try{
        document.getElementById(id).remove();
        app.addCountry(JSON.parse(element.getAttribute("data-json")), countryListIndex);
        app.removeTaggedData(taggedDataIndex);
        renderAllTaggedData();
        createSuggList([]);
    }catch(err) {
        errorHanlder({error: err});
        console.log('Error in deleteTag', err)
    }
}

const updateRecordDisplay = (data) =>{
    let record = document.getElementById('record');
    let _data = data.map((ele) => {
        return ele.data;
    })
    record.innerHTML = JSON.stringify(_data);
}

const errorHanlder = (param) => {
    switch(param.type){
        case ERROR_TYPE.API_ERROR:
            alert('Fail to Fetch the api. Try again');
            break;
        default:
            alert('Don`t Panic...It might be some error in json. Kindly contact developer @ niravkapoor27@gmail.com')
            break;
    }
}
