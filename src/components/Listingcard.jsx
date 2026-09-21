function ListingCard({ listing }) {
  return (
    <div className="listing-card">
      <img src={listing.image} alt={listing.product} />

      <div className="listing-card-body">
        <h3>{listing.product}</h3>
        <p className="listing-category">{listing.category}</p>

        <div className="listing-details">
          <span>{listing.quantity} {listing.unit}</span>
          <span>₦{listing.price}</span>
        </div>

        <p className="listing-location">📍 {listing.location}</p>
      </div>
    </div>
  )
}

export default ListingCard