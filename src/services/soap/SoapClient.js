import { SOAP_API_URL } from '../config.js';

export const SoapClient = {
    /**
     * Sends a SOAP request
     * @param {string} action - The SOAP Action (WebMethod name)
     * @param {Object} params - The parameters for the method
     * @returns {Promise<any>} - The parsed result
     */
    async call(action, params = {}) {
        const envelope = this.createEnvelope(action, params);

        try {
            const response = await fetch(SOAP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': `http://paquetes.sencillo/${action}`
                },
                body: envelope
            });

            const text = await response.text();
            console.log(`SOAP ${action} raw XML response:`, text);

            if (!response.ok) {
                throw new Error(`SOAP Error: ${response.status} - ${text}`);
            }

            return this.parseResponse(text, action);
        } catch (error) {
            console.error('SOAP Call Failed:', error);
            throw error;
        }
    },

    /**
     * Creates the SOAP Envelope XML
     */
    /**
     * Creates the SOAP Envelope XML
     */
    createEnvelope(action, params) {
        const paramXml = this.toXml(params);

        return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${action} xmlns="http://paquetes.sencillo/">
      ${paramXml}
    </${action}>
  </soap:Body>
</soap:Envelope>`;
    },

    toXml(obj, key = null) {
        let xml = '';

        if (Array.isArray(obj)) {
            // For arrays, we usually repeat the tag for each item, 
            // BUT in SOAP/ASMX, it depends on the WSDL. 
            // Often it's <turistas><TuristaSoap>...</TuristaSoap><TuristaSoap>...</TuristaSoap></turistas>
            // OR just repeating the element if it's "maxOccurs=unbounded"
            // For this specific ASMX, 'turistas' is likely the array wrapper, and inside we need the item type.
            // However, standard ASMX arrays usually look like:
            // <turistas>
            //   <TuristaSoap>...</TuristaSoap>
            //   <TuristaSoap>...</TuristaSoap>
            // </turistas>
            // So if the key is 'turistas', we iterate.

            for (const item of obj) {
                // We need to know the item tag name. 
                // For 'turistas', it's 'TuristaSoap'. 
                // This is a bit hard to genericize without WSDL.
                // We'll try a heuristic: use the singular or a specific mapping if needed.
                // For now, let's assume the object inside has the correct structure or we pass the wrapper.

                // Actually, the caller should pass the structure:
                // params = { turistas: [ { TuristaSoap: { ... } }, ... ] }
                // OR we handle specific keys here.

                // Let's try to just process the item. If the item is an object, it should generate its own tags.
                // But we need the wrapping tag for the item.

                // Heuristic: if key is 'turistas', item tag is 'TuristaSoap'.
                let itemKey = 'item';
                if (key === 'turistas') itemKey = 'TuristaSoap';

                xml += this.toXml(item, itemKey);
            }
        } else if (typeof obj === 'object' && obj !== null) {
            // If it has a key, wrap it.
            if (key) xml += `<${key}>`;

            for (const [prop, value] of Object.entries(obj)) {
                xml += this.toXml(value, prop);
            }

            if (key) xml += `</${key}>`;
        } else {
            // Primitive value
            if (key) xml += `<${key}>${obj}</${key}>`;
        }

        return xml;
    },

    /**
     * Parses the XML response to a JS Object
     * Note: This is a simple parser for the specific structure we expect.
     * For complex objects, we might need a more robust XML parser.
     */
    parseResponse(xml, action) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        // Check for Fault
        const fault = xmlDoc.getElementsByTagName("soap:Fault")[0];
        if (fault) {
            const faultString = fault.getElementsByTagName("faultstring")[0]?.textContent;
            throw new Error(faultString || "Unknown SOAP Fault");
        }

        // Get Result
        const resultTag = `${action}Result`;
        const resultNode = xmlDoc.getElementsByTagName(resultTag)[0];

        if (!resultNode) return null;

        // If it has child nodes (complex object or list), we need to parse it
        if (resultNode.children.length > 0) {
            return this.xmlToJson(resultNode);
        }

        // Simple value
        return resultNode.textContent;
    },

    xmlToJson(xml) {
        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;

                if (nodeName === '#text') {
                    if (item.nodeValue.trim() === "") continue;
                    return item.nodeValue; // Return text directly if it's the only child content
                }

                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    }
};
