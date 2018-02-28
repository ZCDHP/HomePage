export default interface GameDescription {
    id: string
    name: string
    description: string
    coverPath: string
    constructor: (id: string) => React.ReactElement<{ id: string }>
    publishDate: Date
}
