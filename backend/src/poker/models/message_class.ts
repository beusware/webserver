import { log } from "../../../../helpers/log_handler";

export class Message{
    sender: string;
    message: string;
    content: Array<string>;
    toAllPlayers: boolean;
    id: string;
    type: string; // gibt die Css classe an ["chit", "command", "system "]
    raiseAction: string; // raise "to" / "by"
    amount: number;

    constructor (sender: string, message: string, id?: string, toAllPlayers?: boolean, type?: string) {
        this.sender = sender;
        this.message = message;
        this.content = message.toLowerCase().trim().split(" ");
        this.toAllPlayers = toAllPlayers;
        this.id = id;

        const commands = ["check", "call", "raise", "pass", "quit"]
        
        this.type = commands.includes(this.content[0]) ? "command" : "chit";
        if (this.content[0] == "raise") {
            // check for number to raise to
            let raiseConditions: boolean = !isNaN(parseInt(this.content[1]));
            // check if there are the right keywords to raise
            raiseConditions = raiseConditions || (this.content[1] == "by" || this.content[1] == "to") && !isNaN(parseInt(this.content[2]));
            
            this.raiseAction = isNaN(parseInt(this.content[1])) ? this.content[1] : "to";
            this.amount = isNaN(parseInt(this.content[1])) ? parseInt(this.content[2]) : parseInt(this.content[1]);

            // prevents raise commands with wrong keywords
            if (!raiseConditions) this.type = "chit";
        }

        if (type) this.type = type;
    }
}