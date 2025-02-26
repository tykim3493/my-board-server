module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        "comment",
        {
            boardId: {
                type: DataTypes.STRING,
            },
            writer: {
                type: DataTypes.STRING,
            },
            content: {
                type: DataTypes.STRING,
            },
            parent: {
                type: DataTypes.STRING,
            },
        },
        { timestamps: true, freezeTableName: true }
    )

    Comment.associate = (models) => {
        Comment.belongsTo(models.board, { foreignKey: "boardId" })
    }

    return Comment;
}