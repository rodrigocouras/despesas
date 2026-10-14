export const guardarDespesa = async (clienteSupabase, despesa, aoAdicionar) => {
  const { data, error } = await clienteSupabase
    .from("despesas")
    .insert([despesa])
    .select()
    .single();

  if (error) throw error;

  aoAdicionar(data);
};
