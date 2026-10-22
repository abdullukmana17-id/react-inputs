const FlagImg = ({ code, size = 20 }) => (
    <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
        width={size}
        height={size * 0.75}
        alt={code}
        className="object-fit-cover rounded-1 d-inline-block flex-shrink-0"
    />
);

export default FlagImg;