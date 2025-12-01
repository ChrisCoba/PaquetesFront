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
        const resultTag = `${ action } Result`;
        const resultNode = xmlDoc.getElementsByTagName(resultTag)[0];

        if (!resultNode) return null;

        // If it has child nodes (complex object or list), we need to parse it
        if (resultNode.children.length > 0) {
            return this.xmlToJson(resultNode);
        }
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
