const { ApolloServer } = require("apollo-server")
const dns = require("dns")

const typeDefs = `
    type Item {
        id: Int
        type: String
        description: String
    }

    type Query {
        items (type: String): [Item]
    }

    type Domain {
        name: String
        extension: String
        checkout: String
        avaliable: Boolean
    }

    input itemInput { 
        type: String
        description: String
    }

    type Mutation {
        saveItem (item: itemInput): Item
        deleteItem(id: Int): Boolean
        generateDomains: [Domain]
        generateDomain(name: String): [Domain]
    }
`
const items = [
    {
        id: 1,
        type: "prefix",
        description: "Air"
    },
    {
        id: 2,
        type: "prefix",
        description: "Flight"
    },
    {
        id: 3,
        type: "prefix",
        description: "Jet"
    },
    {
        id: 4,
        type: "sufix",
        description: "Hub"
    },
    {
        id: 5,
        type: "sufix",
        description: "Station"
    },
    {
        id: 6,
        type: "sufix",
        description: "Mart"
    }
]

const isDomainAvaliable = (url) => {
    return new Promise((resolve, reject) => {
        dns.resolve(url, (err) => {
            if (err) {
                resolve(true)
            } else {
                resolve(false)
            }
        })

    })

}

const resolvers = {
    Query: {
        items(_, args) {
            return items.filter(item => item.type === args.type)
        }
    },
    Mutation: {
        saveItem(_, args) {
            const item = args.item
            item.id = Math.floor(Math.random() * 1000)
            items.push(item)
            return item
        },
        deleteItem(_, args) {
            const id = args.id
            const item = items.find(item => item.id === id);
            if (!item) {
                return false
            } else {
                items.splice(items.indexOf(item), 1)
                return true
            }
        },
        async generateDomains() {
            const Dominios = [];
            for (const prefix of items.filter(item => item.type === "prefix")) {
                for (const sufix of items.filter(item => item.type === "sufix")) {
                    const name = prefix.description + sufix.description;
                    const url = name.toLowerCase();
                    const checkout = `https://checkout.hostgator.com.br/?a=add&sld=${url}&tld=.com.br`;
                    const avaliable = await isDomainAvaliable(`${url}.com.br`)
                    Dominios.push({
                        name,
                        checkout,
                        avaliable
                    });
                }
            }
            return Dominios
        },
        async generateDomain(_, args) {
            const name = args.name
            const Dominios = []
            const extensions = [".com.br", ".com", ".net", ".org"]
            for (const extension of extensions) {
                const url = name.toLowerCase();
                const checkout = `https://checkout.hostgator.com.br/?a=add&sld=${url}&tld=${extension}`;
                const avaliable = await isDomainAvaliable(`${url}${extension}`)
                Dominios.push({
                    name,
                    extension,
                    checkout,
                    avaliable
                });

            }
            return Dominios
        }
    }

}

const server = new ApolloServer({ typeDefs, resolvers })
server.listen();



