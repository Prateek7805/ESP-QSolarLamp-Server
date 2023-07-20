const origin = (data) =>{
    if(!data){
        return {code: 404, message: 'Origin ID not found'};
    }
    const allowed_origins = process.env.ALLOWED_CLIENT_END_POINTS;
    const allowed_origins_array = allowed_origins.split(',');
    const origin_index = allowed_origins_array.indexOf(data);
    if(origin_index === -1){
        return {code: 400, message: 'Invalid Origin'};
    }
    return {code : 200, message: origin_index};
}

const origin_id = (data) => {
    try{
        if(!data){
            return {code: 404, message: 'Origin ID not found'};
        }
        const index = parseInt(data);
        if(isNaN(index)){
            return {code: 400, message: 'Origin ID is not a number'};
        }
        if(index < 0){
            return {code: 400, message: 'Origin ID is not a negative number'};
        }
        const allowed_origins = process.env.ALLOWED_CLIENT_END_POINTS;
        const allowed_origins_array = allowed_origins.split(',');
        const origin_url = allowed_origins_array[index];
        if(origin_url === undefined){
            return {code: 400, message: 'Origin not allowed'};
        }
        return {code: 200, message: origin_url};
    }catch(err){
        return {code: 500, message: 'Origin ID failed processing'}
    }
}

module.exports = {origin, origin_id};