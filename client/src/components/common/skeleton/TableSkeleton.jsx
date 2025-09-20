import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

const TableSkeleton = (props) => {
  return (
    <SkeletonTheme baseColor="#0d131c" highlightColor="#ffffff1f">
        <p>
        <Skeleton 
            count={props?.count || 1} 
            height={props?.height || 40}
            borderRadius={props?.borderRadius || 5}
        />
        </p>
    </SkeletonTheme>
  )
}

TableSkeleton.propTypes = {
  count: Number,
  height: Number,
  borderRadius: Number
} 

export default TableSkeleton