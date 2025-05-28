import classNames from 'classnames'

const MarkerIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M5 7.71428C5 5.15607 7.19204 3 10 3C12.808 3 15 5.15607 15 7.71428C15 9.11527 14.179 10.8133 12.9489 12.6083C12.0915 13.8594 11.1256 15.0366 10.2524 16.1008C10.1673 16.2045 10.0831 16.3071 10 16.4086C9.91686 16.3071 9.83265 16.2045 9.74757 16.1008C8.8744 15.0366 7.9085 13.8594 7.0511 12.6083C5.82101 10.8133 5 9.11527 5 7.71428Z'
      stroke='#566171'
      strokeWidth='2'
    />
  </svg>
)

export const PropertyData = ({ feature, large = false }) => {
  const {
    id,
    name,
    coords,
    imageUrl,
    description
  } = feature

  const largerTextClass = large ? 'text-2xl' : 'text-xl'
  const smallerTextClass = large ? 'text-base' : 'text-sm'
  const xPaddingClass = large ? 'p-0' : 'p-3'

  return (
    <div className={classNames('py-1.5', xPaddingClass)}>
      <h5
        className={classNames(
          'mb-1.5  font-bold tracking-tight',
          largerTextClass
        )}
      >
        {name}
      </h5>
      <div
        className={classNames(
          'flex items-center text-sm mb-3',
          smallerTextClass
        )}
      >
        <MarkerIcon />
        <p className='font-medium text-gray-500 ml-1.5'>{name}</p>
      </div>
    </div>
  )
}

const Card = ({ feature, width = 'auto', shortImage = false, onClick }) => {
  const handleClick = () => {
    onClick(feature)
  }

  const { imageUrl } = feature

  return (
    <div className='cursor-pointer' onClick={handleClick}>
      <div
        className='bg-white border border-gray-200 rounded-2xl '
        style={{
          width,
          boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div
          className={classNames('bg-cover  m-1.5', {
            'h-44': shortImage,
            'h-52': !shortImage
          })}
          style={{
            backgroundImage: `url("${imageUrl}")`,
            borderRadius: 11.28
          }}
        ></div>
        <PropertyData feature={feature} />
      </div>
    </div>
  )
}

export default Card
