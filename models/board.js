module.exports = (sequelize, DataTypes) => {
    const Board = sequelize.define(
        "board",
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            writer: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
            },
            categoryId: {
                type: DataTypes.STRING,
            },
            fileUrl: {
                type: DataTypes.STRING,
            },
            memberId: {
                type: DataTypes.STRING,
            },
            isNotice: {
                type: DataTypes.INTEGER,
            },
        },
        { timestamps: true, freezeTableName: true }
    )

    Board.associate = (models) => {
        // 외래키(belongsTo) : 다른 테이블의 기본 키(id)를 참조하는 키. 짝꿍 hasmany와 똑같이 넣는다.
        // 소스키(hasMany) : 다른 테이블에서 참조할 키(id, 생략가능)
        Board.belongsTo(models.member, { foreignKey: "memberId" })
        Board.belongsTo(models.category, { foreignKey: "categoryId" })
        Board.hasMany(models.comment, { foreignKey: "boardId" })
        Board.hasMany(models.file, { foreignKey: "fileId" })
    }
    
    return Board;
}