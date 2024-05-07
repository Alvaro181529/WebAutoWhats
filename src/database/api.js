async function postLogin() {
    const url = "";
    const response = await fetch(url, {
        method: "POST",
        body: {data}
    })
    return response.json()
}

async function apiExterno() {
    // const post = await postLogin()
    // const token = post.apiToken
    // const token = ""
    // const url = "http://172.65.14.240:5254/api/MAILITM_FID"
    const url = "https://pokeapi.co/api/v2/ability/?limit=20&offset=20"
    const response = await fetch(url, {
        // method: "GET",
        // headers:{
        //     Authorization:'Bearer{token}'
        // }
    })
    return response.json();
}
module.exports = { apiExterno }