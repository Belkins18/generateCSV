const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const { convertArrayToCSV } = require('convert-array-to-csv');
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const CONTACT_HEADERS = 'Given Name,Additional Name,Family Name,Yomi Name,Given Name Yomi,Additional Name Yomi,Family Name Yomi,Name Prefix,Name Suffix,Initials,Nickname,Short Name,Maiden Name,Birthday,Gender,Location,Billing Information,Directory Server,Mileage,Occupation,Hobby,Sensitivity,Priority,Subject,Language,Photo,Group Membership,E-mail 1 - Type,E-mail 1 - Value,IM 1 - Type,IM 1 - Service,IM 1 - Value,Website 1 - Type,Website 1 - Value'.split(',');

const newKeys = {
    'ФИО покупателя': 'Name',
    'Контактный телефон': 'Phone 1 - Value',
    'Контактный Email': 'E-mail 1 - Value',
    'Количество заказов': null,
    'Общая сумма заказов': null,
    'Метки': 'Notes'
}

const init = async () => {
    const fileData = await readXlsxFile('src/export-clients-06-11-20_11-30-36.xlsx')
    fileData.splice(0, 1);
    
    let contactData = {};
    
    CONTACT_HEADERS.map(header => {
        return Object.assign(contactData, {[header]: null});
    });
    
    const normalizeData = fileData.map(iterable => {
        let initial = {};

        return iterable.reduce((previous, current, index) => {
            if(Object.values(newKeys)[index] !== null) {
               return Object.assign(initial, {[Object.values(newKeys)[index]]: current})
            }
        }, initial);
        
    });

    const dataObjects = normalizeData.map(item => {

        Object.keys(item)
            .find((key, index)=> {
                if (key.indexOf('Phone') !== -1) {
                    item[key] = Object.values(item)[index].split(',').join(' ::: ');
                    item['Phone 1 - Type'] = null;
                }
            })
        
        return {
            ...contactData,
            ...item
        };
        // if (item.indexOf('Phone')) {
            
            
          
        //     // .join(' ::: ')
        // }
        // Object.assign(contactData, { [contact]: null })
        // return {
        //     ...contactData,
        // }
        // CONTACT_HEADERS.map((contact, index) => {
        //     if (contact === 'Name') {
        //         Object.assign(contactData, { [contact]: item[0] })
        //     } else
        //         if (contact.indexOf('E-mail') != -1) {
        //             const emails = item[2].split(',').join(' ::: ');

        //             Object.assign(contactData, { ['E-mail 1 - Type']: null })
        //             Object.assign(contactData, { ['E-mail 1 - Value']: emails })
        //         } else
        //             if (contact === 'Notes') {
        //                 Object.assign(contactData, { [contact]: item[5] })
        //             } else {
        //                 if (item[1]) {
        //                     const phones = item[1].split(',').join(' ::: ');
        //                     Object.assign(contactData, { ['Phone 1 - Type']: null })
        //                     Object.assign(contactData, { ['Phone 1 - Value']: phones })
        //                 }
        //                 Object.assign(contactData, { [contact]: null })
        //             }
        // })
        
    })
    const csvFromArrayOfObjects = convertArrayToCSV(dataObjects);

    fs.writeFile('dist/import-clients.csv', csvFromArrayOfObjects, function (err) {
        if (err) return console.log(err);
    });
};

init();