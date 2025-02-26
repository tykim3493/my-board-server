module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define(
        "file",
        {
            fileId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fileUrl: {
                type: DataTypes.STRING,
            },
        },
        { timestamps: true, freezeTableName: true }
    )

    File.associate = (models) => {
        File.belongsTo(models.board, { foreignKey: "fileId" })
    }

    return File;
}