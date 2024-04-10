
async function apiExterno() {
    const url = "http://172.65.14.240:5254/api/MAILITM_FID"
    const response = await fetch(url, {
        method: "GET"
    })
    return response.json();
    map.url()
}
module.exports ={apiExterno}