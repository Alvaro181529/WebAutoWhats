
async function apiExterno() {
    const url = "http://localhost:5000/"
    const response = await fetch(url, {
        method: "GET"
    })
    return response.json();
}
module.exports ={apiExterno}