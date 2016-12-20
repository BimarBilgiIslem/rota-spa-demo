declare namespace KJUR.jws {
    interface IParsedJWS {
        payloadS: any
    }

    export class JWS {
        verifyJWSByPemX509Cert(idToken: string, cert: string): boolean;
        parsedJWS: IParsedJWS;
    }
}