import PropTypes from 'prop-types';

export default function ComingSoonPage({ title }) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-slate-600">This protected area is being built in the next frontend phase.</p>
    </section>
  );
}

ComingSoonPage.propTypes = { title: PropTypes.string.isRequired };
